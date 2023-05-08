export function emitHandler(socket, event, target, data) {
  socket.emit(event, data);
  socket.to(target).emit(event, data);
}
