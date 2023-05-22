import { MessageData } from "../interface";
import { Message } from "../model";
import { RedisHandler } from "../utils";

export class MessageController {
  public createMessage = async (data: MessageData) => {
    try {
      const message = await Message.create(data).then((res) =>
        res.get({ plain: true })
      );

      await RedisHandler.saveMessage(message);
      delete message.roomId;

      return { message };
    } catch (err) {
      throw new Error("메세지를 전송하지 못했습니다. ");
    }
  };
}

export const messageController = new MessageController();
