import { Op } from "sequelize";
import { User } from "../model/user";
import { RedisHandler } from "../utils";
import { Message } from "./../model/message";
export class MessageService {
  private async getCachedMessages(roomId: string): Promise<any[]> {
    return await RedisHandler.findMessages(roomId);
  }

  public async getRestMessage(
    roomId: string,
    counts: number,
    lastId: string
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
}

export const messageService = new MessageService();
