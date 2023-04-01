import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import { corsOrigin, port, sessionConfig, SESSION_SECRET } from "./config";
import {
  channelRouter,
  githubRouter,
  indexRouter,
  listRouter,
  oauthRouter,
  pageRouter,
  socket,
  templateRouter,
  userRouter,
} from "./routers";
import { LogColor, endPoint } from "./constants";
import {
  wrap,
  socketMiddleware,
  loginRequired,
  errorHandler,
} from "./middlewares";
import { redisClient, subClient } from "./utils/redisClient";
import { MongoAdapter } from "./db/mongo";
import logger from "morgan";
import { MySqlAdapter } from "./db/mysql";
import { createServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { sequelize } from "./db/sequelize";

export class AppServer {
  app: express.Application;
  static PORT = port;

  constructor() {
    this.app = express();
  }
  async config() {
    new MySqlAdapter();
    new MongoAdapter();
    this.middleWare();
    this.routes();
  }

  static async start() {
    const appServer = new AppServer();
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

    await appServer.config();
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
    this.app.use(cors({ origin: corsOrigin, credentials: true }));
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
}
AppServer.start();
