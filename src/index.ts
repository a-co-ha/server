import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { corsOptions, port, SESSION_SECRET } from "./config";
import { endPoint } from "./constants";
import { MongoAdapter, MySqlAdapter } from "./db";
import {
  errorHandler,
  loginRequired,
  morganMiddleware,
  SessionStore,
  useSession,
} from "./middlewares";
import {
  bookmarkListRouter,
  bookmarkRouter,
  channelRouter,
  githubRouter,
  imageRouter,
  indexRouter,
  listRouter,
  oauthRouter,
  pageRouter,
  templateRouter,
  userRouter,
  announcementsRouter,
  calendarRouter,
} from "./routers";
import { Socket, socketEmitter, socketListener } from "./socket";
import { logger } from "./utils";

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

    const socket = new Socket(server, socketListener, socketEmitter);
    await socket.config();
    socket.start();
    server.listen(port, async () => {
      logger.info(`server listening at http://localhost:${port}`);
    });
  }

  private middleWare() {
    this.app.use(morganMiddleware);
    this.app.use(cors(corsOptions));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser(SESSION_SECRET));
    this.app.use(useSession());
    this.app.use(SessionStore.checkSession());
  }

  private routes() {
    this.app.get(endPoint.index, indexRouter);
    this.app.use(endPoint.oauth, oauthRouter);
    this.app.use(endPoint.user, userRouter);
    this.app.use(endPoint.invite, loginRequired, channelRouter);
    this.app.use(endPoint.channel, loginRequired, channelRouter);
    this.app.use(endPoint.page, loginRequired, pageRouter);
    this.app.use(endPoint.template, loginRequired, templateRouter);
    this.app.use(endPoint.list, loginRequired, listRouter);
    this.app.use(endPoint.github, loginRequired, githubRouter);
    this.app.use(endPoint.bookmark, loginRequired, bookmarkRouter);
    this.app.use(endPoint.bookmarks, loginRequired, bookmarkListRouter);
    this.app.use(endPoint.image, loginRequired, imageRouter);
    this.app.use(endPoint.announcements, loginRequired, announcementsRouter);
    this.app.use(endPoint.calendar, loginRequired, calendarRouter);
    this.app.use(errorHandler);
  }
}
AppServer.start();
