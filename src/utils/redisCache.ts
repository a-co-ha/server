import { UserAttributes } from "./../interface/userInterface";
/* eslint-disable no-var */
import { redisClient } from "./redisClient";

// export const mapSession = ([userID, name, connected, img]) =>
//   userID ? { userID, name, connected: connected === "true", img } : undefined;

export default {
  async findSession(id): Promise<UserAttributes> {
    try {
      const a = JSON.parse(await redisClient.get(`session:${id}`)).user;
      return a;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  findLogin: async (id) => {
    try {
      const session = await redisClient.get(`login:${id}`);

      if (session) {
        return JSON.parse(session);
      } else {
        return null;
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  findMessagesForUser: async (userID) => {
    const a = await redisClient
      .lRange(`messages:${userID}`, 0, -1)
      .then((results) => {
        return results.map((result) => JSON.parse(result));
      });

    return a;
  },

  findAllSessions: async (): Promise<any> => {
    const keys = new Set();

    let nextIndex = 0;
    do {
      const { cursor, keys: results } = await redisClient.scan(nextIndex, {
        MATCH: "session:*",
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
      const a = multi.get(command);
      return a;
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

  get: (key) => redisClient.get(`${key}`),

  delete: async (key) => {
    await redisClient.DEL(`session:${key}`);
  },
};
