import { Channel } from "./../model/channel";
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
    console.log(`55555 new connection ${socket.id}`);

    const session = socket.request.session;
    console.log(`666666 saving sid ${socket.id} in session ${session.id}`);

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

    // const messagesPerUser = new Map();
    // messages.forEach((message) => {
    //   const { from, to } = message;
    //   const otherUser = socket.userID === from ? to : from;
    //   if (messagesPerUser.has(otherUser)) {
    //     messagesPerUser.get(otherUser).push(message);
    //   } else {
    //     messagesPerUser.set(otherUser, [message]);
    //   }
    // });

    // sessions.forEach((session) => {
    //   users.push({
    //     userID: session.userID,
    //     username: session.username,
    //     connected: session.connected,
    //     messages: messagesPerUser.get(session.userID) || [],
    //   });
    // });

    socket.emit("users", users);

    // 채널 연결
    for (const channel of socket.channel) {
      socket.join(channel);

      // 커넥션했다고 알림
      socket.broadcast.to(channel).emit("user connected", {
        userID: socket.userID,
        username: socket.username,
        connected: "true",
      });

      // 연결 해제
      socket.on("disconnect", async () => {
        // socket.userID가 들어가 있는 소켓들을 다 가져옴
        const matchingSockets = await io.in(socket.userID).allSockets();

        const isDisconnected = matchingSockets.size === 0;
        if (isDisconnected) {
          socket.broadcast.to(channel).emit("user disconnected", {
            userID: socket.userID,
            username: socket.username,
            connected: "false",
          });

          redisCache.saveSession(socket.sessionID, {
            userID: socket.userID,
            username: socket.username,
            connected: "false",
          });
        }
      });
    }

    // DM 연결
    socket.join(socket.userID);

    // DM
    socket.on("private message", async (data: any) => {
      const { to } = data;
      data.from = socket.userID;
      const response = await messageController.createMessage(data);
      socket.to(to).to(socket.userID).emit("private message", response);
    });

    // 특정 채널에 전체 메세지
    socket.on("message-send", async (data: any) => {
      const { channelId } = data;
      data.from = socket.userID;
      const response = await messageController.createMessage(data);
      socket.to(channelId).to(socket.userID).emit("message-receive", response);
    });
  });
};
