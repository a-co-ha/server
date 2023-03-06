/* eslint-disable prefer-const */
import { redisClient } from "./redisClient";

export default {
  set: async (key, data) => {
    console.log(key, data);
    await redisClient.setex(
      `${key}`,
      86400, // 60 * 60 * 24 seconds
      JSON.stringify({ ...data })
    );
  },

  saveMessage: async (message) => {
    const value = JSON.stringify(message);
    await redisClient
      .multi()
      .rpush(`messages:${message.from}`, value)
      .rpush(`messages:${message.to}`, value)
      .expire(`messages:${message.from}`, 24 * 60 * 60)
      .expire(`messages:${message.to}`, 24 * 60 * 60)
      .exec();
  },

  saveSession: async (id, { userID, username, connected }) => {
    await redisClient
      .multi()
      .hset(
        `session:${id}`,
        "userID",
        userID,
        "username",
        username,
        "connected",
        connected
      )
      .expire(`session:${id}`, 24 * 60 * 60)
      .exec();
  },

  get: (key) => redisClient.getAsync(`${key}`),

  delete: (key) => {
    console.log(key);
    redisClient.del(`${key}`, (err, reply) => {
      if (!err) {
        if (reply === 1) {
          console.log(`${key} is deleted`);
        } else {
          console.log(`${key} doesn't exists`);
        }
      }
    });
  },
};
