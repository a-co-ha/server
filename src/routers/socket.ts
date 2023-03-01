import { channelController, messageController } from "../controllers";

export const socket = (io: any) => {
  io.on("connection", (socket: any) => {
    console.log("🚀 Socket connection");
    socket.on("message-send", async (data: any) => {
      const response = await messageController.createMessage(data);
      io.emit("message-receive", response);
    });

    // 소켓으로 할지 http로 할지 생각해봐야할듯..
    socket.on("team-new-member", async (data: any) => {
      // const response = await channelController.join(data);
      // io.emit("team-receive-new-member", response);
    });
  });
};
