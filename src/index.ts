import express from "express";
import cors from "cors";
import createError from "http-errors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import logger from "morgan";
import session from "express-session";
import { port, mongoDBUri } from "./config";
import {
  indexRouter,
  oauthRouter,
  channelRouter,
  postRouter,
  usersSocketRouter,
  progressRouter,
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

export const app = express();
mongoose.connect(mongoDBUri);
mongoose.connection.on("connected", () => {
  console.log(`Successfully connected to MongoDB: ${mongoDBUri}`);
});

init();

require("./routers/passport/github");
app.use(
  session({
    resave: false, // 매번 세션 강제 저장
    saveUninitialized: false, // 빈 값도 저장
    secret: "session-secret", // cookie 암호화 키. dotenv 라이브러리로 감춤
    cookie: {
      httpOnly: true, // javascript로 cookie에 접근하지 못하게 하는 옵션
      secure: false, // https 프로토콜만 허락하는 지 여부
    },
  })
);

app.use(passport.initialize());
app.use(passport.session()); // express-session 모듈 아래에 코드를 작성해야 한다. 미들웨어 간에 서로 의존관계가 있는 경우 순서가 중요

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get(endPoint.index, indexRouter);
app.use(endPoint.oauth, oauthRouter);
app.use(endPoint.channel, loginRequired, channelRouter);
app.use(endPoint.post, postRouter);
app.use(endPoint.progress, progressRouter);
app.use(errorHandler);

const httpServer = createServer(app);

const io = new Server(httpServer);
io.on("connection", (socket) => {
  console.log("Socket connection");
  usersSocketRouter(socket);
});

httpServer.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});
