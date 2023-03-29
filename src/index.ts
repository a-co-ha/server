import { socketMiddleware } from "./middlewares/io";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import logger from "morgan";
import session from "express-session";
import cluster from "cluster";
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
  decode,
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
    Promise.all([redisClient.connect(), subClient.connect()]).then(() => {
      io.adapter(createAdapter(redisClient, subClient));
    });
    io.use(wrap(session(sessionConfig)));
    io.use(socketMiddleware);
    socket(io);
    server.listen(port, async () => {
      try {
        await sequelize.authenticate().then(() => {
          console.log("DB sequelize connection success");
        });
        console.log(`server listening at http://localhost:${port}`);
      } catch (err) {
        console.error(err);
        console.log("Server running failed");
      }
    });
  }

  private middleWare() {
    this.app.use(
      cors({
        origin: [
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
      console.log(`Successfully connected to MongoDB: ${mongoDBUri}`);
    });
  }

  private mysql() {
    init();
  }
}
AppServer.start();
