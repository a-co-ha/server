import { Message } from "./../model/message";
import redisCache from "../utils/redisCache";

interface IMessageController {
  createMessage: any;
}
export class MessageController implements IMessageController {
  createMessage = async (data: any) => {
    const { roomId, text, name, img, from } = data;

    // redisCache.delete(`messageList:${channelId}`);
    //  logger.info({ name, githubID, img, text, channelId });
    const messageResponse = await Message.create({
      name,
      img,
      text: text,
      roomId,
    });
    const message = messageResponse.get({ plain: true });
<<<<<<< HEAD
    message["userId"] = from;
    delete message.roomId;
=======
   message["userId"] = from;
>>>>>>> 4004ea6c8bf04ead8807159270386f23e69efd82
    await redisCache.saveMessage(data);

    return { message };
  };
}

export const messageController = new MessageController();
