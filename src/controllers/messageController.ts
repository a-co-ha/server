import { MessageService, messageService } from "./../services/messageService";
import { Message } from "./../model/message";
import { logger, RedisHandler } from "../utils";
import { AsyncRequestHandler } from "../utils";

interface IMessageController {
  createMessage: AsyncRequestHandler;
}
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
