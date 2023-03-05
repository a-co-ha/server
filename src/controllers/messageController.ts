import { Message } from "./../model/message";
import redisCache from "../utils/redisCache";

interface IMessageController {
  createMessage: any;
}
export class MessageController implements IMessageController {
  createMessage = async (socket: any) => {
    const { name, githubID, img, text, channelId } = socket;

    redisCache.delete(`messageList:${channelId}`);

    const messageResponse = await Message.create({
      name,
      githubID,
      img,
      text,
      channelId,
    });
    const message = messageResponse.get({ plain: true });

    redisCache.set(channelId, { name, githubID, img, text });
    return {
      meta: {
        type: "success",
        status: 200,
        message: "",
      },
      message,
    };
  };
}

export const messageController = new MessageController();
