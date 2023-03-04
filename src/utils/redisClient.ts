import * as redis from "redis";

export const redisClient = redis.createClient({
  password: "0KK02ZRj590s30wkDg47o3hYTuviGIpg",
  socket: {
    host: "redis-10035.c232.us-east-1-2.ec2.cloud.redislabs.com",
    port: 10035,
  },
  legacyMode: true,
});
redisClient.on("connect", () => {
  console.info("Redis connected!");
});
redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});
redisClient.connect().then().catch(console.error); // redis v4 연결 (비동기)
const redisCli = redisClient.v4; // 기본 redisClient 객체는 콜백기반인데 v4버젼은 프로미스 기반이라 사용
