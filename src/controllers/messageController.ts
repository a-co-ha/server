import { Message } from "./../model/message";
import redisCache from "../utils/redisCache";

interface IMessageController {
  createMessage: any;
}
export class MessageController implements IMessageController {
  createMessage = async (data: any) => {
    const { roomId, text, name, img } = data;

    // redisCache.delete(`messageList:${channelId}`);
    // console.log({ name, githubID, img, text, channelId });
    const messageResponse = await Message.create({
      name,
      img,
      text: text,
      roomId,
    });
    const message = messageResponse.get({ plain: true });

    await redisCache.saveMessage(data);

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
