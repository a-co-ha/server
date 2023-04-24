import { MessageService, messageService } from "./../services/messageService";
import { Message } from "./../model/message";
import redisCache from "../utils/redisCache";
import { AsyncRequestHandler } from "../utils";

interface IMessageController {
  createMessage: AsyncRequestHandler;
  getMessage: AsyncRequestHandler;
}
export class MessageController implements IMessageController {
  constructor(private messageService: MessageService) {}
  createMessage = async (data: any) => {
    const message = await Message.create(data).then((res) =>
      res.get({ plain: true })
    );

    await redisCache.saveMessage(message);
    delete message.roomId;

    return { message };
  };
  getMessage: AsyncRequestHandler = async (req, res) => {
    const roomId = req.params.id;
    const messages = await this.messageService.getMessage(roomId);
    res.json({ roomId, messages });
  };
}

export const messageController = new MessageController(messageService);
