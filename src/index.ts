import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { corsOptions, port, SESSION_SECRET } from "./config";
import {
  channelRouter,
  githubRouter,
  indexRouter,
  listRouter,
  oauthRouter,
  pageRouter,
  templateRouter,
  userRouter,
  bookmarkRouter,
  imageRouter,
  bookmarkListRouter,
} from "./routers";
import { endPoint } from "./constants";
import {
  loginRequired,
  errorHandler,
  DtoValidatorMiddleware,
} from "./middlewares";
import { MongoAdapter, MySqlAdapter } from "./db";

import { createServer } from "http";
import { sequelize } from "./model";
import { InviteDto } from "./dto";
import useSession from "./middlewares/useSession";
import checkSession from "./middlewares/checkSession";
import { Socket } from "./socket/socketServer";
import morgan from "morgan";
import { logger } from "./utils/winston";

export class AppServer {
  app: express.Application;
  static PORT = port;

  constructor() {
    this.app = express();
  }
  async config() {
    this.middleWare();
    new MySqlAdapter();
    new MongoAdapter();
    this.routes();
  }

  static async start() {
    const appServer = new AppServer();
    const server = createServer(appServer.app);
    await appServer.config();

    const socket = new Socket(server);
    await socket.config();
    socket.start();
    server.listen(port, async () => {
      try {
        await sequelize.authenticate().then(() => {
          logger.info("sequelize connection success");
        });
        await sequelize.sync();
        logger.info(`server listening at http://localhost:${port}`);
      } catch (err) {
        logger.error(err);
      }
    });
  }

  private middleWare() {
    const combined =
      ':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
    const morganFormat =
      process.env.NODE_ENV !== "production" ? "development" : combined;
    this.app.use(morgan(morganFormat, { stream: logger.stream }));
    this.app.use(cors(corsOptions));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser(SESSION_SECRET));
    this.app.use(useSession());
    this.app.use(checkSession());
  }

  private routes() {
    this.app.get(endPoint.index, indexRouter);
    this.app.use(endPoint.oauth, oauthRouter);
    this.app.use(endPoint.user, userRouter);
    this.app.use(
      endPoint.invite,
      loginRequired,
      DtoValidatorMiddleware(InviteDto),
      channelRouter
    );
    this.app.use(endPoint.channel, loginRequired, channelRouter);
    this.app.use(endPoint.page, pageRouter);
    this.app.use(endPoint.template, templateRouter);
    this.app.use(endPoint.list, listRouter);
    this.app.use(endPoint.github, githubRouter);
    this.app.use(errorHandler);
    this.app.use(endPoint.bookmark, loginRequired, bookmarkRouter);
    this.app.use(endPoint.image, imageRouter);
    this.app.use(endPoint.bookmarkList, bookmarkListRouter);
  }
}
AppServer.start();
