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
  bookmarkRouter,
  imageRouter,
  bookmarkListRouter,
} from "./routers";
import { LogColor, endPoint } from "./constants";
import {
  wrap,
  socketMiddleware,
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
import { ChannelDto, InviteDto, PageDto } from "./dto";
import { serialize } from "cookie";

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
      cookie: true,
      cors: { origin: corsOrigin, credentials: true },
    });

    io.engine.on("initial_headers", (headers, req) => {
      if (req.session) {
        headers["set-cookie"] = serialize("sid", req.session.id, {
          sameSite: "strict",
        });
      }
    });
    const adapter = await createSocketAdapter();
    io.adapter(adapter);

    io.use(wrap(session(sessionConfig)));
    io.use(socketMiddleware);
    socket(io);

    server.listen(port, async () => {
      try {
        await sequelize.authenticate().then(() => {
          console.info(LogColor.INFO, "sequelize connection success");
        });
        await sequelize.sync();
        console.log("All models were synchronized successfully.");
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
    this.app.use(endPoint.user, loginRequired, userRouter);
    this.app.use(
      endPoint.invite,
      loginRequired,
      DtoValidatorMiddleware(InviteDto),
      channelRouter
    );
    this.app.use(
      endPoint.channel,
      loginRequired,
      DtoValidatorMiddleware(ChannelDto),
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
