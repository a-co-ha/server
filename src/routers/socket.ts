import { redisClient, subClient } from "./../utils/redisClient";
/* eslint-disable prefer-const */
import { messageController } from "../controllers";
import redisCache from "../utils/redisCache";
import { createAdapter } from "@socket.io/redis-adapter";

export const socket = (io: any) => {
  Promise.all([redisClient, subClient]).then(() => {
    io.adapter(createAdapter(redisClient, subClient));
  });

  io.on("connection", async (socket: any) => {
    const session = socket.request.session;

    console.log(`saving sid ${socket.id} in session ${session.id}`);

    // 세션 저장
    redisCache.saveSession(socket.sessionID, {
      userID: socket.userID,
      username: socket.username,
      connected: "true",
    });

    // 내 세션확인
    socket.emit("session", {
      sessionID: socket.sessionID,
      userID: socket.userID,
    });

    // 유저, 메세지 가져오기
    const users = [];
    // const [messages, sessions] = await Promise.all([
    //   redisCache.findMessagesForUser(socket.userID),
    //   redisCache.findAllSessions(),
    // ]);
    // const messages = await redisCache.findMessagesForUser(socket.userID);
    const sessions = await redisCache.findAllSessions();
    // console.log(messages);
    console.log(sessions);

    // 내 채팅방 만듦
    socket.join(socket.id);

    // 커넥션했다고 알림
    socket.broadcast.emit("user connected", {
      userID: socket.userID,
      username: socket.username,
      connected: "true",
    });

    // 전체 메세지
    socket.on("message-send", async (data: any) => {
      const response = await messageController.createMessage(data);
      io.emit("message-receive", response);
    });

    // DM
    socket.on("private message", async (data: any) => {
      const { to } = data;
      const response = await messageController.createMessage(data);
      socket.to(to).to(socket.userID);
      io.emit("private message", response);
    });

    // 연결 해제
    socket.on("disconnect", async () => {
      // socket.userID가 들어가 있는 소켓들을 다 가져옴
      const matchingSockets = await io.in(socket.userID).allSockets();

      const isDisconnected = matchingSockets.size === 0;
      if (isDisconnected) {
        socket.broadcast.emit("user disconnected", socket.userID);

        redisCache.saveSession(socket.sessionID, {
          userID: socket.userID,
          username: socket.username,
          connected: "false",
        });
      }
    });
  });
};
