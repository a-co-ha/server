import { userService, channelService } from "../services";
import { ioCorsOptions } from "../config";
import { Server, Socket as SocketIO } from "socket.io";
import sharedSession from "express-socket.io-session";
import { useSession } from "../middlewares";
import { socketValidation } from "../middlewares";
import { RedisHandler, logger, createSocketAdapter } from "../utils";
import { Server as httpServer } from "http";
import { Room, SocketData } from "../interface";
import { SocketListener } from "./socketListeners";
export class Socket {
  private io: Server;
  private connectedUsers: Map<number, SocketIO>;

  constructor(server: httpServer, private socketListener: SocketListener) {
    this.io = new Server<SocketData>(server, ioCorsOptions);
    this.connectedUsers = new Map();
  }

  async config() {
    const adapter = await createSocketAdapter();
    this.io.adapter(adapter);

    this.io.use(
      sharedSession(useSession(), {
        autoSave: true,
      })
    );
  }

  public start() {
    this.io.on("connection", async (socket: SocketIO) => {
      try {
        const sessionID =
          socket.handshake.auth.sessionID || socket.handshake.headers.sessionid;

        if (!sessionID) {
          throw new Error("세션이 만료되었습니다. 로그인을 해주세요.");
        }

        await socketValidation(sessionID, socket);
        this.connectedUsers.set(socket.userID, socket);

        // DM 연결
        socket.join(socket.userID.toString());

        await this.join(socket, socket.roomIds);
        await this.getUsers(socket);
        await this.userInfo(socket);
        await this.messageStatus(socket);
        await this.myAlert(socket);
      } catch (err: any) {
        logger.error(err.message);
        socket.disconnect();
        return;
      }

      socket.on(
        "JOIN_CHANNEL",
        async ({ channelId }: { channelId: number }) => {
          const newRooms = await channelService.getRooms(channelId);
          await this.join(socket, newRooms);
        }
      );

      socket.on(
        "SEND_MESSAGE",
        this.socketListener.sendMessage(socket, this.connectedUsers)
      );

      socket.on("READ_MESSAGE", this.socketListener.readMessage(socket));

      socket.on("SET_BOOKMARK", this.socketListener.setBookmark(socket));

      socket.on("SET_ALERT", this.socketListener.setLabel(socket));
      socket.on("READ_ALERT", this.socketListener.readLabel(socket));

      socket.on("disconnect", async () => {
        const matchingSockets = await this.io
          .in(socket.userID.toString())
          .fetchSockets();

        const isDisconnected = matchingSockets.length === 0;

        if (isDisconnected) {
          for (const room of socket.roomIds) {
            socket.broadcast.to(room.id).emit("DISCONNECT_MEMBER", {
              roomId: room.id,
              userID: socket.userID,
              name: socket.name,
              connected: false,
            });
          }
        }
      });
    });
  }

  private async messageStatus(socket: any): Promise<void> {
    const { roomIds, userID } = socket;

    const result = await Promise.all(
      roomIds.map((room) => RedisHandler.getRoomReadCount(room.id, userID))
    );
    socket.emit("MESSAGE_STATUS", result);
  }

  private async join(socket: any, roomIds: Room[]): Promise<void> {
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

  private async userInfo(socket: any): Promise<void> {
    const { sessionID, userID, name } = socket;
    const rooms = Array.from(socket.rooms).slice(1).map(String);
    const user = { sessionID, userID, name, rooms };

    socket.emit("USER_INFO", user);
    logger.info(
      `[3] 소켓 접속완료 
      user : ${socket.name}, sessionID : ${socket.sessionID}`
    );
  }

  private async getUsers(socket: any): Promise<void> {
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

  private myAlert = async (socket: SocketIO) => {
    const res = await RedisHandler.getAlert(socket.userID);

    socket.emit("ALERT", res);
  };
}
