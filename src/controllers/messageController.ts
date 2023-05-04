import { MessageService, messageService } from "./../services/messageService";
import { Message } from "./../model/message";
import { RedisHandler } from "../utils";
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
}

export const messageController = new MessageController(messageService);
