import { Socket as SocketIO } from "socket.io";
import { Room } from "../interface";
import { userService } from "../services";
import { logger, RedisHandler } from "../utils";
export class SocketEmitter {
  public async join(socket: SocketIO, roomIds: Room[]): Promise<void> {
    if (roomIds) {
      for (const room of roomIds) {
        socket.join(room.id);

        socket.broadcast.to(room.id).emit("NEW_MEMBER", {
          userID: socket.userID,
          name: socket.name,
          img: socket.img,
        });
      }

      logger.info(
        `[1] 채팅방 조인 user : ${socket.name}, sessionID : ${
          socket.sessionID
        }, rooms : ${JSON.stringify(socket.roomIds)}`
      );
    }
  }

  public async messageStatus(socket): Promise<void> {
    const { roomIds, userID } = socket;
    const status = await Promise.all(
      roomIds.map(async (room) => {
        const status = await RedisHandler.getIsRead(room.id, userID);
        const messages = await RedisHandler.findMessages(room.id);
        return { status, messages };
      })
    );
    socket.emit("MESSAGE_STATUS", status);
  }

  public async userInfo(socket: any): Promise<void> {
    const { sessionID, userID, name } = socket;
    const rooms = Array.from(socket.rooms).slice(1).map(String);
    const user = { sessionID, userID, name, rooms };

    socket.emit("USER_INFO", user);
    logger.info(
      `[3] 소켓 접속완료 
      user : ${socket.name}, sessionID : ${socket.sessionID}`
    );
  }

  public async getUsers(socket: any): Promise<void> {
    const members = await userService.getChannelMembersID(socket.userID);

    if (members.length !== 0) {
      const sessions = await RedisHandler.findMemberSessions(members);

      const users = sessions.map((session) => {
        const { userId, name, img } = JSON.parse(session).user;
        return { userID: userId, name, img };
      });

      socket.emit("MEMBERS", users);

      logger.info(`[2] 현재 접속자 user : ${JSON.stringify(users)}`);
    }
  }

  public myAlert = async (socket: SocketIO) => {
    const res = await RedisHandler.getAlert(socket.userID);

    socket.emit("ALERT", res);
  };
}
export const socketEmitter = new SocketEmitter();
