import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import sharedSession from "express-socket.io-session";
import { corsOrigin, port, SESSION_SECRET } from "./config";
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
  bookmarkRouter,
  imageRouter,
  bookmarkListRouter,
} from "./routers";
import { LogColor, endPoint } from "./constants";
import {
  loginRequired,
  errorHandler,
  DtoValidatorMiddleware,
} from "./middlewares";
import { createSocketAdapter } from "./utils/redisClient";
import { MongoAdapter } from "./db/mongo";
import logger from "morgan";
import { MySqlAdapter } from "./db/mysql";
import { createServer } from "http";
import { Server } from "socket.io";
import { sequelize } from "./model";
import { InviteDto } from "./dto";
import useSession from "./middlewares/useSession";
import checkSession from "./middlewares/checkSession";

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

    const io = new Server(server, {
      transports: ['websocket'],
      allowUpgrades: true,
      cors: { origin: corsOrigin, credentials: true },
    });

    const adapter = await createSocketAdapter();
    io.adapter(adapter);

    io.use(
      sharedSession(useSession(), {
        autoSave: true,
      })
    );

    socket(io);

    server.listen(port, async () => {
      try {
        await sequelize.authenticate().then(() => {
          console.info(LogColor.INFO, "sequelize connection success");
        });
        await sequelize.sync();
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
    this.app.use(cors({ origin: corsOrigin, credentials: true ,  optionsSuccessStatus: 200}));
    this.app.use(logger("dev"));
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
    this.app.use(
      endPoint.channel,
      loginRequired,
      // DtoValidatorMiddleware(ChannelDto),
      channelRouter
    );
    this.app.use(
      endPoint.page,
      // loginRequired,
      // DtoValidatorMiddleware(PageDto),
      pageRouter
    );
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
