import { chatBookmarkService } from "./services/chatBookmarkService";
import { UserService, userService } from "./services/userService";
import { ioCorsOptions } from "./config";
import { Server, Socket as SocketIO } from "socket.io";
import { createSocketAdapter } from "./utils/redisClient";
import sharedSession from "express-socket.io-session";
import useSession from "./middlewares/useSession";
import { socketValidation } from "./middlewares";
import redisCache from "./utils/redisCache";
import { messageController } from "./controllers";
import { logger } from "./utils/winston";
import { Server as httpServer } from "http";
import { MessageAttributes } from "./interface";
interface SocketData {
  sessionID?: string;
  userID: number;
  name: string;
  rooms: string[];
}

interface UserData {
  roomId: string;
  userID: number;
  name: number;
  connected: boolean;
}

export class Socket {
  private io: Server;
  private currentSocket: { [key: string]: SocketIO } = {};

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

  public async join(socket: any) {
    // DM 연결
    socket.join(socket.userID);
    // Room 연결
    if (socket.roomIds) {
      for (const room of socket.roomIds) {
        socket.join(room);

        // 커넥션했다고 알림
        socket.broadcast.to(room).emit("NEW_MEMBER", {
          roomId: room,
          userID: socket.userID,
          name: socket.name,
          connected: true,
        });
      }
    }
  }

  public start() {
    this.io.on("connection", async (socket: any) => {
      try {
        // const sessionID = socket.handshake.headers.sessionid;

        const sessionID = socket.handshake.auth.sessionID;

        await socketValidation(sessionID, socket);

        this.currentSocket[socket.userID] = socket;

        await this.join(socket);
        await this.getUsers(socket);
        await this.userInfo(socket);
      } catch (err: any) {
        logger.error(err.message);
        socket.disconnect();
        return;
      }

      // 특정 채널에 전체 메세지
      socket.on(
        "SEND_MESSAGE",
        async ({ roomId, text }: { roomId: string; text: string }) => {
          const data = {
            from: socket.userID,
            name: socket.name,
            img: socket.img,
            text,
            to: roomId,
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
          const data = {
            bookmarkName,
            content,
            roomId,
            userId: socket.userID,
            userName: socket.name,
          };
          const createBookmark = await chatBookmarkService.createBookmark(data);
          socket.emit("NEW_BOOKMARK", createBookmark);
          socket.to(roomId).emit("NEW_BOOKMARK", createBookmark);
        }
      );
      // 연결 해제
      socket.on("disconnect", async () => {
        delete this.currentSocket[socket.userID];
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

  private async userInfo(socket: any): Promise<void> {
    const { sessionID, userID, name } = socket;
    const rooms = Array.from(socket.rooms).slice(1).map(String);
    const user = {
      sessionID,
      userID,
      name,
      rooms,
    };

    socket.emit("USER_INFO", user);
  }

  private async getUsers(socket: any): Promise<void> {
    const members = await userService.getChannelMembersID(socket.userID);
    if (members.length !== 0) {
      const sessions = await redisCache.findMemberSessions(members);

      const users = sessions.map((session) => {
        const { userId, name, img } = JSON.parse(session).user;
        return {
          userID: userId,
          name,
          img,
        };
      });

      socket.emit("MEMBERS", users);
    }
  }
}
