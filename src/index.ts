import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import sharedSession from "express-socket.io-session";
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
import { LogColor, endPoint, TokenType } from "./constants";
import {
  wrap,
  socketMiddleware,
  loginRequired,
  errorHandler,
  DtoValidatorMiddleware,
  socketValidation,
  decode,
} from "./middlewares";
import { createSocketAdapter } from "./utils/redisClient";
import { MongoAdapter } from "./db/mongo";
import logger from "morgan";
import { MySqlAdapter } from "./db/mysql";
import { createServer } from "http";
import { Server } from "socket.io";

import { sequelize } from "./model";
import { ChannelDto, InviteDto, PageDto } from "./dto";

export class AppServer {
  app: express.Application;
  static PORT = port;

  constructor() {
    this.app = express();
  }
  async config() {
    this.app.use(session(sessionConfig));
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
    const sessionMiddleware = session(sessionConfig);
    const adapter = await createSocketAdapter();
    io.adapter(adapter);

    io.use(
      sharedSession(sessionMiddleware, {
        autoSave: true,
      })
    );

    io.use(async (socket, next) => {
      if (socket.handshake.auth && socket.handshake.auth.token) {
        const user = socket.handshake.auth.token;
        const tokenType = user.split(" ")[0];
        const token = user.split(" ")[1];
        if (
          !(tokenType === TokenType.ACCESS || tokenType === TokenType.REFRESH)
        ) {
          return next(new Error("토큰 타입 에러"));
        }
        const decoded = await decode(token);
        socket.user = decoded;

        next();
      }
    });

    io.use(wrap(socketMiddleware));
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
    this.app.use(cors({ origin: corsOrigin, credentials: true }));
    this.app.use(logger("dev"));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser(SESSION_SECRET));
    this.app.use(session(sessionConfig));
    this.app.use((req, res, next) => {
      const cookieString = req.headers.cookie; // 쿠키 문자열 가져오기
      console.log("cookieString:", cookieString); // 쿠키 문자열 출력하기

      const session = req.session; // 세션 객체 가져오기
      console.log("session:", session.id);
      res.setHeader("set-cookie", session);
      next();
    });
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
