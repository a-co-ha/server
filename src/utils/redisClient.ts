import * as redis from "redis";
import Promise from "bluebird";

import dotenv from "dotenv";
dotenv.config();
const host =  process.env.REDIS_HOST;
export const redisClient: any = Promise.promisifyAll(
  redis.createClient({
    socket: {
      host: host,
      port: 6379,
    },
    legacyMode: true,
  })
);
export const subClient = redisClient.duplicate();

redisClient.on("connect", () => {
  console.info("pubClient Redis connected!");
});
redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

subClient.on("connect", () => {
  console.info("subClient Redis connected!");
});
subClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});
subClient.on("ready", (err) => {
  console.error("Redis Client ready", err);
});

subClient.on("end", (err) => {
  console.error("Redis Client end", err);
});

subClient.on("warning", (err) => {
  console.error("Redis Client warning", err);
});
// redisClient.connect().then().catch(console.error); // redis v4 연결 (비동기)
// export const redisCli = redisClient.v4;
// export const subCli = subClient.v4;
