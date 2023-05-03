import moment from "moment-timezone";
import { Socket } from "socket.io";
import { dateFormat } from "../constants";
import { messageController } from "../controllers";
import { BookmarkInterface } from "../interface/bookmarkInterface";
import { Message } from "../interface/messageInterface";
import { bookmarkService } from "../services";
import { messageService } from "../services/messageService";
import { getCurrentDate, RedisHandler } from "../utils";

export class SocketListener {
  public sendMessage =
    (socket: Socket, connectedUsers: Map<number, Socket>) =>
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
              const status = await RedisHandler.getRoomReadCount(roomId, user);
              return recipientSocket.emit("UPDATE_STATUS", status);
            }
          }
        })
      );
    };

  public readMessage =
    (socket: Socket) =>
    async ({ roomId }: { roomId: string }) => {
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
    };

  public setBookmark =
    (socket: Socket) =>
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
    };

  public setLabel = (socket: Socket) => async (content: any) => {
    const { channelName, pageName, targetUserId, targetUserName } = content;
    const subPageName = content?.subPageName;
    const res = subPageName
      ? `${channelName}의 ${pageName} - ${subPageName}에서 ${targetUserName}님을 태그했습니다. `
      : `${channelName}의 ${pageName}에서 ${targetUserName}님을 태그했습니다. `;
    await RedisHandler.setAlert(targetUserId);
    socket.to(targetUserId).emit("GET_ALERT", res);
  };
  public readLabel = (socket: Socket) => async () => {
    await RedisHandler.readAlert(socket.userID);
    const res = await RedisHandler.getAlert(socket.userID);
    socket.to(socket.userID.toString()).emit("GET_ALERT", res);
  };
}

export const socketListener = new SocketListener();
