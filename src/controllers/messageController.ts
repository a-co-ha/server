import { userService } from "./../services/userService";
import { AsyncRequestHandler } from "../types";

interface IMessageController {
  createMessage: any;
}
export class MessageController implements IMessageController {
  createMessage = async (socket: any) => {
    const { channelId, userId, text, userName, avatarurl } = socket;

    // redisCache.delete(`messageList:${channelId}`);
  };
}

export const messageController = new MessageController();
