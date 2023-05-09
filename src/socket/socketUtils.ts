import { Socket } from "socket.io";

export const emitHandler = (
  socket: Socket,
  event: string,
  target: string,
  data: any
) => {
  socket.emit(event, data);
  socket.to(target).emit(event, data);
};
