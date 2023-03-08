/* eslint-disable no-var */

import { redisCli } from "./redisClient";
import { promisify } from "util";
const hmgetAsync = promisify(redisClient.hmget).bind(redisClient);
const lrangeAsync = promisify(redisClient.lrange).bind(redisClient);
const hgetallAsync = promisify(redisClient.hgetall).bind(redisClient);
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

  findSession: async (id) => {
    return await hmgetAsync(
      `session:${id}`,
      "userID",
      "username",
      "connected"
    ).then(mapSession);
  },

  findMessagesForUser: async (userID) => {
    return await lrangeAsync(`messages:${userID}`, 0, -1).then((results) => {
      return results.map((result) => JSON.parse(result));
    });
  },

  findAllSessions: async () => {
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

    return redisClient
      .multi(commands)
      .exec()
      .then((results) => {
        console.log(results);
        return results
          .map(([err, session]) => (err ? undefined : mapSession(session)))
          .filter((v) => !!v);
      });

    // var multi = redisClient.multi();

    // for (var i = 0; i < commands.length; i++) {
    //   multi = multi.hgetall(commands[i]);
    // }
    // let result;
    // multi.exec(function (err, replies) {
    //   if (err) {
    //     console.error(err);
    //   } else {
    //     result = replies;
    //   }
    // });
    // return result;
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
// function getSessions(keys: Set<unknown>) {
//   throw new Error("Function not implemented.");
// }
