import crypto from "crypto";
import redisCache from "./utils/redisCache";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import logger from "morgan";
import session from "express-session";
import cluster from "cluster";
import http from "http";
import { setupMaster } from "@socket.io/sticky";
import { createAdapter, setupPrimary } from "@socket.io/cluster-adapter";
import { port, mongoDBUri, sessionConfig, SESSION_SECRET } from "./config";
import {
  indexRouter,
  oauthRouter,
  channelRouter,
  postRouter,
  socket,
  progressRouter,
  userRouter,
} from "./routers";
import { endPoint } from "./constants";
import passport from "passport";
import { decode, errorHandler, loginRequired, wrap } from "./middlewares";
import { init } from "./db/mysql";
import { createServer } from "http";
import { Server } from "socket.io";
import { sequelize } from "./model";

import { userService } from "./services";

export const app = express();
const sessionMiddleware = session(sessionConfig);
const passportMiddleware = passport.initialize();
const randomId = () => crypto.randomBytes(8).toString("hex");

mongoose.set("strictQuery", true);
mongoose.connect(mongoDBUri);
mongoose.connection.on("connected", () => {
  console.log(`Successfully connected to MongoDB: ${mongoDBUri}`);
});

init();

require("./routers/passport/github");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(SESSION_SECRET));

app.use(sessionMiddleware);
app.use(passportMiddleware);
app.use(passport.session());

app.get(endPoint.index, indexRouter);
app.use(endPoint.oauth, oauthRouter);
app.use(endPoint.user, loginRequired, userRouter);
app.use(endPoint.channel, loginRequired, channelRouter);
app.use(endPoint.post, postRouter);
app.use(endPoint.progress, progressRouter);
app.use(errorHandler);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {},
});

io.use(wrap(sessionMiddleware));
io.use(wrap(passportMiddleware));
io.use(wrap(passport.session()));

io.use(async (socket: any, next) => {
  const session = socket.request.session;
  const sessionID = session.id;

  const { user } = session.passport;

  const userChannel = await userService.getChannels(user);

  socket.username = user.name;
  socket.img = user.img;
  socket.channel = userChannel;
  socket.sessionID = sessionID;

  const userInfo = await redisCache.findSession(sessionID);

  if (userInfo?.userID === undefined) {
    socket.userID = randomId();
  } else {
    socket.userID = userInfo.userID;
  }

  next();
});

socket(io);

httpServer.listen(port, async () => {
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
