import dotenv from "dotenv";
import { createClient, RedisClientOptions } from "@redis/client";
import { createAdapter, RedisAdapter } from "@socket.io/redis-adapter";
import { logger } from "./winston";

dotenv.config();
const host = process.env.REDIS_HOST;
const password = process.env.REDIS_PASSWORD;
const port = parseInt(process.env.REDIS_PORT);

const redisOptions: RedisClientOptions = {
  socket: { host, port },
  password,
};

export const redisClient = createClient(redisOptions);

export const subClient = createClient(redisOptions).duplicate();

export const createSocketAdapter = async (): Promise<
  (nsp: any) => RedisAdapter
> => {
  await Promise.all([redisClient.connect(), subClient.connect()]);
  logger.info("Redis clients are all connected!");

  return createAdapter(redisClient, subClient);
};

redisClient.on("error", (err) => {
  logger.error("PUB Failed to connect Redis clients:", err);
});

subClient.on("error", (err) => {
  logger.error("SUB Failed to connect Redis clients:", err);
});
