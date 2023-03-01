export const socket = (io: any) => {
  io.on("connection", (socket: any) => {
    console.log("🚀 Socket connection");
    socket.on("message-send", async (data: any) => {
      // const response = await messageController.createMessage(data);
      // io.emit("message-receive", response);
    });

    socket.on("team-new-member", async (data: any) => {
      // const response = await teamController.addTeamMember(data);
      // io.emit("team-receive-new-member", response);
    });
  });
};
