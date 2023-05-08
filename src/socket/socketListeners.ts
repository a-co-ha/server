import { socketEmitter, SocketEmitter } from "./socketEmitter";
import { pageService } from "./../services/pageService";
import { channelService } from "./../services/channelService";
import moment from "moment-timezone";
import { Socket as SocketIO } from "socket.io";
import { dateFormat } from "../constants";
import { messageController } from "../controllers";
import { BookmarkInterface } from "../interface/bookmarkInterface";
import { Message } from "../interface/messageInterface";
import { bookmarkService } from "../services";
import { messageService } from "../services/messageService";
import { getCurrentDate, logger, RedisHandler } from "../utils";
import { emitHandler } from "./socketUtils";

export class SocketListener {
  constructor(private socketEmitter: SocketEmitter) {}

  public joinChannel =
    (socket: SocketIO) =>
    async ({ channelId }: { channelId: number }) => {
      const newRooms = await channelService.getRooms(channelId);
      await this.socketEmitter.join(socket, newRooms);
    };

  public sendMessage =
    (socket: SocketIO) =>
    async ({ content, roomId }: { content: string; roomId: string }) => {
      const { readUser } = socket.roomIds.find((room) => room.id === roomId);

      const data: Message = {
        userId: socket.userID,
        name: socket.name,
        img: socket.img,
        content,
        roomId,
        readUser,
      };
      const message = await messageController.createMessage(data);

      emitHandler(socket, "RECEIVE_MESSAGE", roomId, message);

      await RedisHandler.setReadMessagePerRoom(data.roomId, data.readUser);
      await RedisHandler.resetRead(data.roomId, data.userId);
    };

  public readMessage =
    (socket: SocketIO) =>
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

      await RedisHandler.resetRead(roomId, socket.userID);

      messages = cachedMessages;

      socket.emit("GET_MESSAGE", messages);
    };

  public setBookmark =
    (socket: SocketIO) =>
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
      emitHandler(socket, "NEW_BOOKMARK", roomId, createBookmark);
    };

  public setLabel = (socket: SocketIO) => async (content: any) => {
    const { channelId, pageId, targetUserId, targetUserName } = content;
    const subPageName = content?.subPageId;

    const { channelName } = await channelService.getChannelInfo(channelId);
    const { pageName } = await pageService.findPageNameByPageId(pageId);

    const res = subPageName
      ? `${channelName}의 ${pageName} - ${subPageName}에서 ${targetUserName}님을 태그했습니다. `
      : `${channelName}의 ${pageName}에서 ${targetUserName}님을 태그했습니다. `;
    await RedisHandler.setAlert(targetUserId);
    socket.to(targetUserId).emit("GET_ALERT", res);
  };
  public readLabel = (socket: SocketIO) => async () => {
    await RedisHandler.readAlert(socket.userID);
    const res = await RedisHandler.getAlert(socket.userID);
    socket.to(socket.userID.toString()).emit("GET_ALERT", res);
  };
}

export const socketListener = new SocketListener(socketEmitter);
