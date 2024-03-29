import { Socket as SocketIO } from "socket.io";
import { Room } from "../interface";
import { pageService, userService } from "../services";
import { logger, RedisHandler } from "../utils";
export class SocketEmitter {
  public async join(socket: SocketIO, roomIds: Room[]): Promise<void> {
    if (roomIds) {
      const members = [];
      for (const room of roomIds) {
        socket.join(room.id);
        members.push(room.readUser.flat());
      }
      const filterMember = [...new Set(members.flat())];

      for (const member of filterMember) {
        socket.broadcast.to(member.toString()).emit("NEW_MEMBER", {
          userID: socket.userID,
          name: socket.name,
          img: socket.img,
        });
      }
      await this.userInfo(socket);
    }
  }

  private async userInfo(socket: any): Promise<void> {
    const { sessionID, userID, name } = socket;
    const rooms = Array.from(socket.rooms).slice(1).map(String);
    const user = { sessionID, userID, name, rooms };

    socket.emit("USER_INFO", user);
    logger.info(
      `[1] 소켓 접속완료 
      user : ${socket.name}, sessionID : ${socket.sessionID} , rooms : ${rooms}`
    );
  }

  public async messageStatus(socket: SocketIO): Promise<void> {
    const { roomIds, userID } = socket;
    const status = await Promise.all(
      roomIds.map(async (room: Room) => {
        const channelId = await pageService.findChannelID(room.id);
        const status = await RedisHandler.getIsRead(room.id, userID);
        return { status, channelId };
      })
    );
    socket.emit("MESSAGE_STATUS", status);
  }

  public async getCurrentMembers(socket: any): Promise<void> {
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
    const isRead = await RedisHandler.getAlertStatus(socket.userID);
    const alerts = await RedisHandler.getAlert(socket.userID);
    socket.emit("ALERT", { isRead, alerts });
  };
}
export const socketEmitter = new SocketEmitter();
