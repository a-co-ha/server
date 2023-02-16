export const usersSocketRouter = (socket: any) => {
  socket.onAny((event: any) => {
    console.log(event);
  });
  socket.on("join_room", (roomName: string) => {
    console.log(socket.rooms);
    console.log(roomName);
  });
  socket.on("new_message", (msg: string, room: string) => {
    socket.to(room).emit("new_message", msg);
  });
};
