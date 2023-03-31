import { LogColor } from "./../types/index";
import * as redis from "redis";
import Promise from "bluebird";

import dotenv from "dotenv";
dotenv.config();
const host = process.env.REDIS_HOST;

export const redisClient = Promise.promisifyAll(
  redis.createClient({
    socket: {
      host: host,
      port: 6379,
    },
    legacyMode: true,
  })
);

export const subClient = Promise.promisifyAll(redisClient.duplicate());

// redisClient.connect().then().catch(console.error); // redis v4 연결 (비동기)
export const redisCli = redisClient.v4;
