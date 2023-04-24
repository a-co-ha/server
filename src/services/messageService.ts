import { Op } from "sequelize";
import { User } from "../model/user";
import { RedisHandler } from "../utils";
import { Message } from "./../model/message";
export class MessageService {
  private async getCachedMessages(roomId: string): Promise<any[]> {
    return await RedisHandler.findMessages(roomId);
  }

  private async getRestMessage(
    roomId: string,
    counts: number,
    lastId: number
  ): Promise<any[]> {
    const messages: any = await Message.findAll({
      include: {
        model: User,
        attributes: ["userId"],
      },
      where: {
        roomId,
        id: { [Op.lt]: lastId },
      },
      attributes: {
        exclude: ["roomId"],
      },
      order: [["id", "DESC"]],
      limit: counts,
      raw: true,
    });

    const modifiedMessages = messages.map((message) => {
      const modifiedMessage = { ...message };
      modifiedMessage.userId = message["user.userId"];
      delete modifiedMessage["user.userId"];
      return modifiedMessage;
    });

    return modifiedMessages;
  }
  public async getMessage(roomId: string): Promise<any[]> {
    const cachedMessages = await this.getCachedMessages(roomId);

    const length = cachedMessages.length;

    if (length !== 0 && length < 100) {
      const counts = 100 - length;
      const lastId = cachedMessages[length - 1].id;

      const restMessage = await this.getRestMessage(roomId, counts, lastId);

      return [...cachedMessages, ...restMessage];
    }

    return cachedMessages;
  }
}
export const messageService = new MessageService();
