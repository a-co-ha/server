import moment from "moment-timezone";
import { Server, Socket as SocketIO } from "socket.io";
import { dateFormat } from "../constants";
import { messageController } from "../controllers";
import { BookmarkInterface, MessageData } from "../interface";
import {
  bookmarkService,
  channelService,
  messageService,
  pageService,
} from "../services";
import { getCurrentDate, RedisHandler } from "../utils";
import { socketEmitter, SocketEmitter } from "./socketEmitter";
import { emitHandler, socketsInRoom } from "./socketUtils";

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

      const data: MessageData = {
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
    const { channelId, pageId, targetUserId, targetUserName, subPageId } =
      content;

    try {
      const { channelName } = await channelService.getChannelInfo(channelId);
      const { pageName } = await pageService.findPageNameByPageId(pageId);

      const result: any = { channelName, pageName, targetUserName };

      if (subPageId) {
        const { pageName: subPageName } =
          await pageService.findPageNameByPageId(subPageId);
        result.subPageName = subPageName;
      }

      await RedisHandler.setAlert(targetUserId);

      socket.to(targetUserId).emit("GET_ALERT", result);
    } catch (err) {
      throw new Error("페이지를 찾을 수 없습니다.");
    }
  };

  public readLabel = (socket: SocketIO) => async () => {
    await RedisHandler.readAlert(socket.userID);

    const res = await RedisHandler.getAlert(socket.userID);

    socket.to(socket.userID.toString()).emit("GET_ALERT", res);
  };

  public disconnect =
    (socket: SocketIO, io: Server, connectedSession: Map<string, SocketIO>) =>
    async () => {
      connectedSession.delete(socket.sessionID);

      const isDisconnected =
        (await socketsInRoom(io, socket.userID)).length === 0;

      if (isDisconnected) {
        for (const room of socket.roomIds) {
          socket.leave(room.id);

          socket.broadcast.to(room.id).emit("DISCONNECT_MEMBER", {
            roomId: room.id,
            userID: socket.userID,
            name: socket.name,
            connected: false,
          });
        }
      }
    };
}

export const socketListener = new SocketListener(socketEmitter);
