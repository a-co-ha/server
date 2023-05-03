import { messageService } from "./../services/messageService";
import { BookmarkInterface } from "./../interface/bookmarkInterface";
import { userService, bookmarkService, channelService } from "../services";
import { ioCorsOptions } from "../config";
import { Server, Socket as SocketIO } from "socket.io";
import sharedSession from "express-socket.io-session";
import { useSession } from "../middlewares";
import { socketValidation } from "../middlewares";
import {
  RedisHandler,
  logger,
  getCurrentDate,
  createSocketAdapter,
} from "../utils";
import { messageController } from "../controllers";
import { Server as httpServer } from "http";
import moment from "moment-timezone";
import { dateFormat } from "../constants";
import { Message } from "../interface/messageInterface";
import { Room, SocketData } from "../interface";

const connectedUsers = new Map();
export class Socket {
  private io: Server;

  constructor(server: httpServer) {
    this.io = new Server<SocketData>(server, ioCorsOptions);
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
    this.io.on("connection", async (socket: any) => {
      try {
        const sessionID =
          socket.handshake.auth.sessionID || socket.handshake.headers.sessionid;

        if (!sessionID) {
          throw new Error("세션이 만료되었습니다. 로그인을 해주세요.");
        }

        await socketValidation(sessionID, socket);

        // DM 연결
        socket.join(socket.userID);

        await this.join(socket, socket.roomIds);
        await this.getUsers(socket);
        await this.userInfo(socket);
        connectedUsers.set(socket.userID, socket);
      } catch (err: any) {
        logger.error(err.message);
        socket.disconnect();
        return;
      }

      await this.messageStatus(socket);

      socket.on(
        "JOIN_CHANNEL",
        async ({ channelId }: { channelId: number }) => {
          const newRooms = await channelService.getRooms(channelId);
          await this.join(socket, newRooms);
        }
      );

      // 특정 채널에 전체 메세지
      socket.on(
        "SEND_MESSAGE",
        async ({ content, roomId }: { content: string; roomId: string }) => {
          const { readUser } = socket.roomIds[0];
          const data: Message = {
            userId: socket.userID,
            name: socket.name,
            img: socket.img,
            content,
            roomId,
            readUser,
          };
          const message = await messageController.createMessage(data);

          socket.emit("RECEIVE_MESSAGE", message);
          socket.to(roomId).emit("RECEIVE_MESSAGE", message);

          await Promise.all(
            readUser.map(async (user) => {
              if (user !== socket.userID) {
                const recipientSocket = connectedUsers.get(user);
                if (recipientSocket) {
                  const status = await RedisHandler.getRoomReadCount(
                    roomId,
                    user
                  );
                  return recipientSocket.emit("UPDATE_STATUS", status);
                }
              }
            })
          );
        }
      );

      socket.on("READ_MESSAGE", async ({ roomId }: { roomId: string }) => {
        const cachedMessages = await RedisHandler.findMessages(roomId);

        const length = cachedMessages.length;
        let messages = [];
        if (length !== 0 && length < 20) {
          const counts = 100 - length;
          const lastId = cachedMessages[0].id;

          const restMessage = await messageService.getRestMessage(
            roomId,
            counts,
            lastId
          );

          messages = [...restMessage, ...cachedMessages];
        }

        await RedisHandler.setLastMessagePerRoom(
          roomId,
          socket.userID,
          cachedMessages[length - 1].id
        );
        await RedisHandler.resetRead(roomId, socket.userID);

        messages = cachedMessages;

        socket.emit("READ_MESSAGE", messages);
      });

      // 북마크 등록
      socket.on(
        "SET_BOOKMARK",
        async ({
          bookmarkName,
          content,
          roomId,
        }: {
          bookmarkName: string;
          content: string;
          roomId: string;
        }) => {
          const date = moment(getCurrentDate()).format(dateFormat);

          const data: BookmarkInterface = {
            bookmarkName,
            content,
            roomId,
            userId: socket.userID,
            name: socket.name,
            createdAt: date,
            updatedAt: date,
          };
          const createBookmark = await bookmarkService.createBookmark(data);
          socket.emit("NEW_BOOKMARK", createBookmark);
          socket.to(roomId).emit("NEW_BOOKMARK", createBookmark);
        }
      );

      // 연결 해제
      socket.on("disconnect", async () => {
        const matchingSockets = await this.io.in(socket.userID).fetchSockets();

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
  public async messageStatus(socket: any) {
    const { roomIds, userID } = socket;

    const result = await Promise.all(
      roomIds.map((room) => {
        return RedisHandler.getRoomReadCount(room.id, userID);
      })
    );
    socket.emit("MESSAGE_STATUS", result);
    return result;
  }

  public async join(socket: any, roomIds: Room[]) {
    if (roomIds) {
      for (const room of roomIds) {
        socket.join(room.id);
        socket.broadcast.to(room).emit("NEW_MEMBER", {
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
}
