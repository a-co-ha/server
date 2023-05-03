import { MessageService, messageService } from "./../services/messageService";
import { Message } from "./../model/message";
import { RedisHandler } from "../utils";
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

    await RedisHandler.saveMessage(message);
    await RedisHandler.setLastMessagePerRoom(
      data.roomId,
      data.userId,
      // message.id,
      data.readUser
    );
    await RedisHandler.resetRead(data.roomId, data.userId);
    delete message.roomId;

    return { message };
  };

  getMessage: AsyncRequestHandler = async (req, res) => {
    const roomId = req.params.id;
    const { userId } = req.body;
    const messages = await this.messageService.getMessage(roomId, userId);
    res.json({ roomId, messages });
  };
}

export const messageController = new MessageController(messageService);
