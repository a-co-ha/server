export const usersSocketRouter = (socket: any) => {
  socket.onAny((event: any) => {
    console.log(event);
  });
  socket.on("joinRoom", (roomName: string) => {
    console.log(socket.rooms);
    console.log(roomName);
    console.log(socket.request);
    socket.join(roomName);
  });
  socket.on("new_message", (msg: string, room: string) => {
    socket.to(room).emit("new_message", msg);
  });
};
