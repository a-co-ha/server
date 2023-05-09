import { Server, Socket } from "socket.io";

export const emitHandler = (
  socket: Socket,
  event: string,
  target: string,
  data: any
) => {
  socket.emit(event, data);
  socket.to(target).emit(event, data);
};

export const socketsInRoom = async (io: Server, room: number | string) => {
  return await io.in(room.toString()).fetchSockets();
};
