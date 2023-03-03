import express from "express";
import cors from "cors";

import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import logger from "morgan";
import * as redis from "redis";
import session from "express-session";
import {
  port,
  mongoDBUri,
  REDIS_PORT,
  REDIS_TIME_TO_LIVE,
  SESSION_SECRET,
  REDIS_HOST,
} from "./config";
import {
  indexRouter,
  oauthRouter,
  channelRouter,
  postRouter,
  socket,
  progressRouter,
  userRouter,
} from "./routers";
import { endPoint } from "./constants";
import passport from "passport";

import {
  DtoValidatorMiddleware,
  errorHandler,
  loginRequired,
} from "./middlewares";
import { init } from "./db/mysql";
import { createServer } from "http";
import { Server } from "socket.io";
import { sequelize } from "./model";
import connectRedis from "connect-redis";

export const app = express();

mongoose.set("strictQuery", true);
mongoose.connect(mongoDBUri);
mongoose.connection.on("connected", () => {
  console.log(`Successfully connected to MongoDB: ${mongoDBUri}`);
});

init();

require("./routers/passport/github");

const redisClient = redis.createClient({
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
redisClient.connect().then(); // redis v4 연결 (비동기)
const redisCli = redisClient.v4; // 기본 redisClient 객체는 콜백기반인데 v4버젼은 프로미스 기반이라 사용
const RedisStore = connectRedis(session);

app.use(
  session({
    // store: new RedisStore({
    //   client: redisClient,
    //   prefix: "session:",
    // }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: false,
      path: "/",
      secure: false,
      maxAge: 604800000, // 1000 * 60 * 60 * 24 * 7 in milliseconds
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get(endPoint.index, indexRouter);
app.use(endPoint.oauth, oauthRouter);
app.use(endPoint.user, loginRequired, userRouter);
app.use(endPoint.channel, loginRequired, channelRouter);
app.use(endPoint.post, postRouter);
app.use(endPoint.progress, progressRouter);
app.use(errorHandler);
const httpServer = createServer(app);

const io = new Server(httpServer);
socket(io);
httpServer.listen(port, async () => {
  try {
    await sequelize.authenticate().then(() => {
      console.log("DB sequelize connection success");
    });
    console.log(`Server listening on port: ${port}`);
  } catch (err) {
    console.error(err);
    console.log("Server running failed");
  }
});
