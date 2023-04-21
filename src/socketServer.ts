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
interface SocketData {
  sessionID: string;
  userID: string;
  name: string;
  roomIds: string;
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
export class Socket {
  private io: Server;
  private currentSocket: { [key: string]: SocketIO } = {};

  constructor(server: httpServer) {
    this.io = new Server(server, ioCorsOptions);
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

  public async join(room: string, userID) {
    const socket = this.currentSocket[userID];
    if (socket) {
      socket.join(room);
      this.io.to(room).emit("user connected", {
        userID: userID,
        connected: "true",
      });
    }
  }

  public start() {
    this.io.on("connection", async (socket: any) => {
      try {
        const sessionID = socket.handshake.auth.sessionID;
        const userID = socket.handshake.auth.userID;

        await socketValidation(sessionID, userID, socket);

        this.currentSocket[socket.userID] = socket;

        // 내 세션확인
        socket.emit("session", {
          sessionID: socket.sessionID,
          userID: socket.userID,
          name: socket.name,
          roomIds: socket.roomIds,
        });
      } catch (err: any) {
        logger.error(err.message);
        socket.disconnect();
      }
      const users = await this.getUsers(socket);
      socket.emit("users", users);

      if (socket.roomIds) {
        // 채널 연결
        for (const room of socket.roomIds) {
          socket.join(room);

          // 커넥션했다고 알림
          socket.broadcast.to(room).emit("user connected", {
            roomId: room,
            userID: socket.userID,
            name: socket.name,
            connected: "true",
          });
        }
      }

      // DM 연결
      socket.join(socket.userID);

      // DM
      socket.on("private message", async (data: any) => {
        const { to } = data;
        data.from = socket.userID;
        const response = await messageController.createMessage(socket);
        socket.to(to).to(socket.userID).emit("private message", response);
      });

      // 특정 채널에 전체 메세지
      socket.on("message-send", async (data: any) => {
        const { roomId, text } = data;
        data.from = socket.userID;
        data.name = socket.name;
        data.img = socket.img;
        data.text = text;
        data.to = roomId;
        const response = await messageController.createMessage(data);
        socket.to(roomId).emit("message-receive", response);
      });

      // 연결 해제
      socket.on("disconnect", async () => {
        delete this.currentSocket[socket.userID];
        const matchingSockets = await this.io.in(socket.userID).fetchSockets();

        const isDisconnected = matchingSockets.length === 0;

        if (isDisconnected) {
          for (const room of socket.roomIds) {
            socket.broadcast.to(room).emit("user disconnected", {
              roomId: room,
              userID: socket.userID,
              name: socket.name,
              connected: "false",
            });
          }
        }
      });
    });
  }

  private async getUsers(socket: any): Promise<any> {
    const users = [];
    const [sessions] = await Promise.all([
      redisCache.findAllSessions().then((res) => {
        return res.map((session) => JSON.parse(session).user);
      }),
    ]);

    sessions.forEach((session) => {
      users.push({
        userID: session.userId,
        name: session.name,
        img: session.img,
      });
    });
    return users;
  }
}