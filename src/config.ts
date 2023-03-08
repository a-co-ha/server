import dotenv from "dotenv";
import connectRedis from "connect-redis";
import session from "express-session";
import * as redis from "redis";
// import { redisClient } from "./utils/redisClient";

const envFound = dotenv.config();

// if (envFound.error) {
//   throw new Error("Couldn't find .env file");
// }

export const port = parseInt(process.env.PORT ?? "8080", 10);
export const mongoDBUri = process.env.DB_MONGO || "not found";
export const mysqlHost = process.env.DB_NAME || "localhost";
export const oauthClient = process.env.GITHUB_OAUTH_CLIENT_ID;
export const oauthSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
export const oauthRedirect = process.env.GITHUB_OAUTH_REDIRECT_URL;
export const jwtSecret = process.env.JWT_SECRET || "JWT_SECRET";
export const mysqlPort = parseInt(process.env.MYSQL_PORT ?? "3306");
export const mysqlUser = process.env.MYSQL_USER;
export const mysqlPassword = process.env.MYSQL_PASSWORD;
export const mysqlDataBase = process.env.MYSQL_DATABASE;
export const inviteApi = process.env.INVITE_URL;
export const s3keyId = process.env.S3KEYID;
export const s3accesskey = process.env.S3ACCESSKEY;
export const s3region = process.env.REGION;

export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = parseInt(process.env.REDIS_PORT ?? "10035");
export const REDIS_USERNAME = process.env.REDIS_USERNAME;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
export const REDIS_TIME_TO_LIVE = process.env.REDIS_TIME_TO_LIVE;
export const { SESSION_SECRET } = process.env;
export const config = {
  development: {
    username: mysqlUser,
    password: mysqlPassword,
    database: mysqlDataBase,
    host: mysqlHost,
    port: mysqlPort,
    dialect: process.env.TYPEORM_CONNECTION,
  },
};

// const redisClient = redis.createClient({
//   password: "0KK02ZRj590s30wkDg47o3hYTuviGIpg",
//   socket: {
//     host: "redis-10035.c232.us-east-1-2.ec2.cloud.redislabs.com",
//     port: 10035,
//   },
// });
// redisClient.on("connect", () => {
//   console.info("Redis connected!");
// });

// const RedisStore = connectRedis(session);

// export const sessionConfig = {
//   store: new RedisStore({
//     client: redisClient,
//     port: REDIS_PORT,
//     host: REDIS_HOST,
//     ttl: REDIS_TIME_TO_LIVE,
//   }),
//   secret: SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     httpOnly: false,
//     path: "/",
//     secure: false,
//     maxAge: 604800000, // 1000 * 60 * 60 * 24 * 7 in milliseconds
//   },
// };
