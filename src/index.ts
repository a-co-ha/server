import express from "express";
import cors from "cors";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import { corsOptions, port, SESSION_SECRET } from "./config";
import { endPoint } from "./constants";
import { MongoAdapter, MySqlAdapter, connect } from "./db";
import { InviteDto, BookMarkDto } from "./dto";
import { Socket } from "./socket/socketServer";
import { logger } from "./utils";
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
import {
  loginRequired,
  errorHandler,
  useSession,
  morganMiddleware,
  DtoValidatorMiddleware,
  SessionStore,
} from "./middlewares";

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
    await connect();
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
    this.app.use(endPoint.bookmark, loginRequired, bookmarkRouter);
    this.app.use(endPoint.bookmarks, loginRequired, bookmarkListRouter);
    this.app.use(endPoint.image, imageRouter);
    this.app.use(errorHandler);
  }
}
AppServer.start();
