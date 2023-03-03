import * as redis from "redis";
import Promise from "bluebird";

export const redisClient = Promise.promisifyAll(
  redis.createClient({
    password: "0KK02ZRj590s30wkDg47o3hYTuviGIpg",
    socket: {
      host: "redis-10035.c232.us-east-1-2.ec2.cloud.redislabs.com",
      port: 10035,
    },
  })
);
redisClient.on("connect", () => {
  console.info("Redis connected!");
});
redisClient.on("error", (err: any) => {
  console.log(`Error ${err}`);
});
