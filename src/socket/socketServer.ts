import { ioCorsOptions } from "./../config";
import { Server } from "socket.io";
import { createSocketAdapter } from "../utils/redisClient";
import sharedSession from "express-socket.io-session";
import useSession from "../middlewares/useSession";
import { socketValidation } from "../middlewares";
import { LogColor } from "../constants";
import redisCache from "../utils/redisCache";
import { messageController } from "../controllers";

export class Socket {
  private io: Server;

  constructor(server: any) {
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

  start() {
    this.io.on("connection", async (socket: any) => {
      const sessionID = socket.handshake.auth.sessionID;
      await socketValidation(sessionID, socket);

      console.log(
        LogColor.INFO,
        `socket connected userID : ${socket.userID} sessionID : ${socket.sessionID} name : ${socket.name}`
      );

      // 내 세션확인
      socket.emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID,
        name: socket.name,
      });

      const users = [];
      const [messages, sessions] = await Promise.all([
        redisCache.findMessagesForUser(socket.userID),
        redisCache.findAllSessions().then((res) => {
          return res.map((session) => JSON.parse(session).user);
        }),
      ]);

      const messagesPerUser = new Map();
      messages.forEach((message) => {
        const { from, to } = message;
        const otherUser = socket.userID === from ? to : from;
        if (messagesPerUser.has(otherUser)) {
          messagesPerUser.get(otherUser).push(message);
        } else {
          messagesPerUser.set(otherUser, [message]);
        }
      });

      sessions.forEach((session) => {
        users.push({
          userID: session.userId,
          name: session.name,
          img: session.img,
          messages: messagesPerUser.get(session.userId) || [],
        });
      });

      socket.emit("users", users);

      if (socket.roomIds) {
        // 채널 연결
        for (const room of socket.roomIds) {
          socket.join(room);

          // 커넥션했다고 알림
          socket.broadcast.to(room).emit("user connected", {
            userID: socket.userID,
            username: socket.username,
            connected: "true",
          });

          // 연결 해제
          socket.on("disconnect", async () => {
            const matchingSockets = await this.io
              .in(socket.userID)
              .allSockets();

            const isDisconnected = matchingSockets.size === 0;
            if (isDisconnected) {
              socket.broadcast.to(room).emit("user disconnected", {
                userID: socket.userID,
                username: socket.name,
              });
            }
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
        const { roomId } = data;
        data.from = socket.userID;
        data.name = socket.name;
        data.text = socket.text;
        data.img = socket.img;
        data.to = roomId;
        const response = await messageController.createMessage(data);
        socket.to(roomId).to(socket.userID).emit("message-receive", response);
      });
    });
  }
}
