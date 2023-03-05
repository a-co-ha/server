/* eslint-disable prefer-const */
import { messageController } from "../controllers";

export const socket = (io: any) => {
  io.on("connection", (socket: any) => {
    const session = socket.request.session;
    console.log(`saving sid ${socket.id} in session ${session.id}`);
    session.socketId = socket.id;
    session.save();

    socket.on("message-send", async (data: any) => {
      const response = await messageController.createMessage(data);
      io.emit("message-receive", response);
    });

    socket.on("private message", ({ content, to }) => {
      io.to(to).emit("private message", {
        content,
        from: socket.id,
      });
    });

    // 연결 해제
    socket.on("disconnect", () => {
      console.log(`${socket.id} is disconnected`);
      socket.broadcast.emit("user disconnected", socket.id);
    });
  });
};
