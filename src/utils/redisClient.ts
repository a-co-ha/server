import * as redis from "redis";
import Promise from "bluebird";

import dotenv from "dotenv";
dotenv.config();

// const password = process.env.REDIS_PASSWORD;
const host = process.env.REDIS_HOST;

export const redisClient: any = Promise.promisifyAll(
  redis.createClient({
    socket: {
      // host: "127.0.0.1",
      host: "redis-server",
      port: 6379,
    },
    legacyMode: true,
  })
);

export const subClient = redisClient.duplicate();

redisClient.on("connect", () => {
  console.info("Redis connected!");
});
redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});
redisClient.connect().then().catch(console.error); // redis v4 연결 (비동기)

export const redisCli = redisClient.v4;
