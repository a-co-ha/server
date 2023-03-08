import { promisify } from "bluebird";
import { redisCli } from "./redisClient";
/* eslint-disable prefer-const */
import { redisClient } from "./redisClient";
const mapSession = ([userID, username, connected]) =>
  userID ? { userID, username, connected: connected === "true" } : undefined;

export default {
  set: async (key, data) => {
    console.log(key, data);
    await redisClient.setex(
      `${key}`,
      86400, // 60 * 60 * 24 seconds
      JSON.stringify({ ...data })
    );
  },
  findSession(id) {
    return redisClient
      .hmget(`session:${id}`, "userID", "username", "connected")
      .then(mapSession);
  },
  findMessagesForUser: async (userID) => {
    return await redisClient
      .lrange(`messages:${userID}`, 0, -1)
      .then((results) => {
        return results.map((result) => JSON.parse(result));
      });
  },

  async findAllSessions() {
    const keys = new Set();
    let nextIndex = 0;
    do {
      const [nextIndexAsStr, results] = await redisClient.scanAsync(
        nextIndex,
        "MATCH",
        "session:*",
        "COUNT",
        "100"
      );

      nextIndex = parseInt(nextIndexAsStr, 10);
      results.forEach((s) => keys.add(s));
    } while (nextIndex !== 0);

    const commands = [];
    keys.forEach((key) => {
      commands.push(["hmget", key, "userID", "username", "connected"]);
    });
    console.log(commands);
    // const multi = redisClient.multi(commands);
    // console.log(multi)
    // return promisify(multi.exec).call(multi);
    return redisClient
      .multi(commands)
      .exec()
      .then((results) => {
        console.log(results);
        return results
          .map(([err, session]) => (err ? undefined : mapSession(session)))
          .filter((v) => !!v);
      });
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
