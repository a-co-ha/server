import dotenv from "dotenv";
import { createClient, RedisClientOptions } from "@redis/client";
import { createAdapter, RedisAdapter } from "@socket.io/redis-adapter";
import { logger } from "./winston";
dotenv.config();

const redisOptions: RedisClientOptions = {
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
  password: process.env.REDIS_PASSWORD,
};

export const redisClient = createClient(redisOptions);

export const subClient = createClient(redisOptions).duplicate();

export const createSocketAdapter = async (): Promise<
  (nsp: any) => RedisAdapter
> => {
  await Promise.all([redisClient.connect(), subClient.connect()]);
  logger.info("Redis clients are all connected!");
  try {
    return createAdapter(redisClient, subClient);
  } catch (err) {
    logger.error("Failed to connect Redis clients:", err);
    throw new Error("Failed to connect Redis clients");
  }
};

redisClient.on("error", (err) => {
  logger.error("PUB Failed to connect Redis clients:", err);
});

subClient.on("error", (err) => {
  logger.error("SUB Failed to connect Redis clients:", err);
});
