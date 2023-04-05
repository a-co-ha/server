/* eslint-disable no-var */
import { RedisCommandRawReply } from "@redis/client/dist/lib/commands";
import { redisClient } from "./redisClient";

export const mapSession = ([userID, name, connected, img]) =>
  userID ? { userID, name, connected: connected === "true", img } : undefined;

export default {
  async findSession(id) {
    return await redisClient
      .hmGet(`session:${id}`, ["userID", "name", "connected", "img"])
      .then(([userID, name, connected, img]) =>
        userID
          ? { userID, name, connected: connected === "true", img }
          : undefined
      );
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
      const a = multi.hmGet(command, ["userID", "name", "connected", "img"]);
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

  saveSession: async (id, { userID, name, img, connected }) => {
    await redisClient
      .multi()
      .hSet(`session:${id}`, [
        "userID",
        userID,
        "name",
        name,
        "img",
        img,
        "connected",
        connected,
      ])
      .expire(`session:${id}`, 24 * 60 * 60)
      .exec();
  },

  get: (key) => redisClient.get(`${key}`),

  delete: async (key) => {
    await redisClient.DEL(key);
  },
};
function getSessions(keys: Set<unknown>) {
  throw new Error("Function not implemented.");
}
