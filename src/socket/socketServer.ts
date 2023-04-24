import { bookmarkService } from "../services/bookmarkService";
import { UserService, userService } from "../services/userService";
import { ioCorsOptions } from "../config";
import { Server, Socket as SocketIO } from "socket.io";
import { createSocketAdapter } from "../utils/redisClient";
import sharedSession from "express-socket.io-session";
import useSession from "../middlewares/useSession";
import { imageUpload, socketValidation } from "../middlewares";
import redisCache from "../utils/redisCache";
import { messageController } from "../controllers";
import { logger } from "../utils/winston";
import { Server as httpServer } from "http";
import { getCurrentDate } from "../utils";
import moment from "moment-timezone";

interface SocketData {
  sessionID?: string;
  userID: number;
  name: string;
  rooms: string[];
}

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface UserData {
  roomId: string;
  userID: number;
  name: number;
  connected: boolean;
}

export class Socket {
  private io: Server;

  constructor(server: httpServer) {
    this.io = new Server<SocketData>(server, ioCorsOptions);
  }

  async config() {
    const adapter = await createSocketAdapter();
    this.io.adapter(adapter);

    this.io.use(
      sharedSession(useSession(), {
        autoSave: true,
      })
    );
  }

  public start() {
    this.io.on("connection", async (socket: any) => {
      try {
        const sessionID =
          socket.handshake.auth.sessionID || socket.handshake.headers.sessionid;

        if (!sessionID) {
          throw new Error("Session ID not found");
        }

        await socketValidation(sessionID, socket);

        // DM 연결
        socket.join(socket.userID);

        await this.join(socket, socket.roomIds);
        await this.getUsers(socket);
        await this.userInfo(socket);
      } catch (err: any) {
        logger.error(err.message);
        socket.disconnect();
        return;
      }

      socket.on("JOIN_CHANNEL", async ({ roomIds }: { roomIds: string[] }) => {
        await this.join(socket, roomIds);
      });

      // 특정 채널에 전체 메세지
      socket.on(
        "SEND_MESSAGE",
        async ({ content, roomId }: { content: string; roomId: string }) => {
          const data = {
            userId: socket.userID,
            name: socket.name,
            img: socket.img,
            content,
            roomId,
          };
          const message = await messageController.createMessage(data);
          socket.emit("RECEIVE_MESSAGE", message);
          socket.to(roomId).emit("RECEIVE_MESSAGE", message);
        }
      );

      // DM
      socket.on("SEND_PRIVATE_MESSAGE", async (data: any) => {
        const { to } = data;
        data.from = socket.userID;
        const response = await messageController.createMessage(socket);
        socket
          .to(to)
          .to(socket.userID)
          .emit("RECEIVE_PRIVATE_MESSAGE", response);
      });

      // 북마크 등록
      socket.on(
        "SET_BOOKMARK",
        async ({
          bookmarkName,
          content,
          roomId,
        }: {
          bookmarkName: string;
          content: string;
          roomId: string;
        }) => {
          const date = moment(getCurrentDate()).format("YYYY-MM-DD HH:mm:ss");

          const data = {
            bookmarkName,
            content,
            roomId,
            userId: socket.userID,
            name: socket.name,
            createdAt: date,
            updatedAt: date,
          };
          const createBookmark = await bookmarkService.createBookmark(data);
          socket.emit("NEW_BOOKMARK", createBookmark);
          socket.to(roomId).emit("NEW_BOOKMARK", createBookmark);
        }
      );
      // 연결 해제
      socket.on("disconnect", async () => {
        const matchingSockets = await this.io.in(socket.userID).fetchSockets();

        const isDisconnected = matchingSockets.length === 0;

        if (isDisconnected) {
          for (const room of socket.roomIds) {
            socket.broadcast.to(room).emit("DISCONNECT_MEMBER", {
              roomId: room,
              userID: socket.userID,
              name: socket.name,
              connected: false,
            });
          }
        }
      });
    });
  }

  public async join(socket: any, roomIds: string[]) {
    if (roomIds) {
      for (const room of roomIds) {
        socket.join(room);
        socket.broadcast.to(room).emit("NEW_MEMBER", {
          roomId: room,
          userID: socket.userID,
          name: socket.name,
          connected: true,
        });
      }
    }
  }

  private async userInfo(socket: any): Promise<void> {
    const { sessionID, userID, name } = socket;
    const rooms = Array.from(socket.rooms).slice(1).map(String);
    const user = { sessionID, userID, name, rooms };
    socket.emit("USER_INFO", user);
  }

  private async getUsers(socket: any): Promise<void> {
    const members = await userService.getChannelMembersID(socket.userID);

    if (members.length !== 0) {
      const sessions = await redisCache.findMemberSessions(members);

      const users = sessions.map((session) => {
        const { userId, name, img } = JSON.parse(session).user;
        return { userID: userId, name, img };
      });

      socket.emit("MEMBERS", users);
    }
  }
}
