import { LogColor } from "./types/index";
import { socketMiddleware } from "./middlewares/io";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import logger from "morgan";
import session from "express-session";
import util from "util";

import { port, mongoDBUri, sessionConfig, SESSION_SECRET } from "./config";
import {
  indexRouter,
  oauthRouter,
  channelRouter,
  pageRouter,
  socket,
  listRouter,
  userRouter,
  githubRouter,
  templateRouter,
} from "./routers";
import { endPoint } from "./constants";
import {
  DtoValidatorMiddleware,
  errorHandler,
  loginRequired,
  wrap,
} from "./middlewares";

import { init } from "./db/mysql";
import { createServer } from "http";
import { Server } from "socket.io";
import { sequelize } from "./model";
import { createAdapter } from "@socket.io/redis-adapter";

import { redisClient, subClient } from "./utils/redisClient";
class AppServer {
  app: express.Application;
  static PORT = port;
  constructor() {
    this.app = express();
  }
  config() {
    this.mongo();
    this.mysql();
    this.middleWare();
    this.routes();
  }
  static start() {
    const appServer = new AppServer();
    appServer.config();
    const server = createServer(appServer.app);
    const io = new Server(server, {
      cors: {},
    });
    redisClient.on("connect", () => {
      console.info(LogColor.INFO, "pubClient Redis connected!");
      subClient.on("connect", () => {
        console.info(LogColor.INFO, "subClient Redis connected!");
        io.adapter(createAdapter(redisClient, subClient));
        console.log("ho");
      });
      subClient.on("error", (err) => {
        console.error("subClient Redis error", err);
      });
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error", err);
    });

    subClient.on("error", (err) => {
      console.error("subClient Redis error", err);
    });

    redisClient.connect();

    io.use(wrap(session(sessionConfig)));
    io.use(socketMiddleware);
    socket(io);
    server.listen(port, async () => {
      try {
        await sequelize.authenticate().then(() => {
          console.info(LogColor.INFO, "sequelize connection success");
        });
        console.info(
          LogColor.INFO,
          `server listening at http://localhost:${port}`
        );
      } catch (err) {
        console.error(err);
      }
    });
  }

  private middleWare() {
    this.app.use(
      cors({
        origin: [
          "http://ec2-54-180-147-65.ap-northeast-2.compute.amazonaws.com",
          "http://localhost:3001",
          "https://acoha.site",
          "https://npm.acoha.site",
        ],
        credentials: true,
      })
    );
    this.app.use(logger("dev"));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(cookieParser(SESSION_SECRET));
    this.app.use(session(sessionConfig));
  }

  private routes() {
    this.app.get(endPoint.index, indexRouter);
    this.app.use(endPoint.oauth, oauthRouter);
    this.app.use(endPoint.invite, loginRequired, channelRouter);
    this.app.use(endPoint.user, loginRequired, userRouter);
    this.app.use(
      endPoint.channel,
      loginRequired,
      // DtoValidatorMiddleware(ChannelDto),
      channelRouter
    );
    this.app.use(endPoint.page, pageRouter);
    this.app.use(endPoint.template, templateRouter);
    this.app.use(endPoint.list, listRouter);
    this.app.use(endPoint.github, githubRouter);
    this.app.use(errorHandler);
  }

  private mongo() {
    mongoose.set("strictQuery", true);
    mongoose.connect(mongoDBUri);
    mongoose.connection.on("connected", () => {
      console.info(LogColor.INFO, `connected to MongoDB`);
    });
  }

  private mysql() {
    init();
  }
}
AppServer.start();
