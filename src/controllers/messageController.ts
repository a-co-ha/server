import { MessageService, messageService } from "./../services";
import { Message } from "./../model";
import { RedisHandler } from "../utils";
import { IMessageController } from "../interface";

export class MessageController implements IMessageController {
  constructor(private messageService: MessageService) {}
  createMessage = async (data: any) => {
    const message = await Message.create(data).then((res) =>
      res.get({ plain: true })
    );

    await RedisHandler.saveMessage(message);

    delete message.roomId;

    return { message };
  };
}

export const messageController = new MessageController(messageService);
