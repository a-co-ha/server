import dotenv from "dotenv";
import { createClient, RedisClientOptions } from "@redis/client";
import { createAdapter, RedisAdapter } from "@socket.io/redis-adapter";
import { logger } from "./winston";

dotenv.config();
const host = process.env.REDIS_HOST;
const password = process.env.REDIS_PASSWORD;

const redisOptions: RedisClientOptions = {
  socket: {
    host: host,
    port: 6379,
  },
  password: password,
};

export const redisClient = createClient(redisOptions);

export const subClient = createClient(redisOptions).duplicate();

export const createSocketAdapter = async (): Promise<
  (nsp: any) => RedisAdapter
> => {
  await Promise.all([redisClient.connect(), subClient.connect()]);
  logger.info("Redis clients are all connected!");

  const adapter = createAdapter(redisClient, subClient);
  return adapter;
};

redisClient.on("error", (err) => {
  logger.error("PUB Failed to connect Redis clients:", err);
});
subClient.on("error", (err) => {
  logger.error("SUB Failed to connect Redis clients:", err);
});
