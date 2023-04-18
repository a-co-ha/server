/* eslint-disable no-var */
import { UserAttributes } from "./../interface/userInterface";
import { redisClient } from "./redisClient";

// export const mapSession = ([userID, name, connected, img]) =>
//   userID ? { userID, name, connected: connected === "true", img } : undefined;

export default {
  async saveUserSession(userID: number, sessionID: string) {
    await redisClient.setEx(
      `user:${userID}`,
      86400, // 60 * 60 * 24 seconds
      JSON.stringify({ sessionID })
    );
  },

  async getUserSession(userID: number) {
    return JSON.parse(await redisClient.get(`user:${userID}`));
  },
  async findSession(id: string): Promise<UserAttributes> {
    try {
      return JSON.parse(await redisClient.get(`session:${id}`)).user;
    } catch (e) {
      throw new Error(`세션을 찾을 수 없습니다.`);
    }
  },

  findMessagesForUser: async (roomId) => {
    return await redisClient
      .lRange(`messages:${roomId}`, 0, -1)
      .then((results) => {
        return results.map((result) => JSON.parse(result));
      });
  },

  findAllSessions: async (): Promise<any> => {
    const keys = new Set();

    let nextIndex = 0;
    do {
      const { cursor, keys: results } = await redisClient.scan(nextIndex, {
        MATCH: `session:*`,
        COUNT: 100,
      });

      nextIndex = cursor;

      results.forEach((s) => keys.add(s));
    } while (nextIndex !== 0);

    const commands = [];
    keys.forEach((key) => {
      commands.push(key);
    });

    var multi = redisClient.multi();

    commands.forEach(async (command) => {
      return multi.get(command);
    });

    const result = await new Promise((resolve, reject) => {
      resolve(multi.EXEC());
    });

    return result;
  },

  saveMessage: async (message) => {
    message.createAt = new Date();
    const value = JSON.stringify(message);
    await redisClient
      .multi()
      .rPush(`messages:${message.from}`, value)
      .rPush(`messages:${message.to}`, value)
      .expire(`messages:${message.from}`, 24 * 60 * 60)
      .expire(`messages:${message.to}`, 24 * 60 * 60)
      .exec();
  },

  delete: async (key) => {
    await redisClient.DEL(`session:${key}`);
  },
};
