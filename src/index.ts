import express from "express";
import cors from "cors";

import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import logger from "morgan";

import session from "express-session";
import {
  port,
  mongoDBUri,
  REDIS_PORT,
  REDIS_TIME_TO_LIVE,
  SESSION_SECRET,
  REDIS_HOST,
  sessionConfig,
} from "./config";
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

import { errorHandler, loginRequired } from "./middlewares";
import { init } from "./db/mysql";
import { createServer } from "http";
import { Server } from "socket.io";
import { sequelize } from "./model";

export const app = express();

mongoose.set("strictQuery", true);
mongoose.connect(mongoDBUri);
mongoose.connection.on("connected", () => {
  console.log(`Successfully connected to MongoDB: ${mongoDBUri}`);
});

init();

require("./routers/passport/github");

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get(endPoint.index, indexRouter);
app.use(endPoint.oauth, oauthRouter);
app.use(endPoint.user, loginRequired, userRouter);
app.use(endPoint.channel, loginRequired, channelRouter);
app.use(endPoint.post, postRouter);
app.use(endPoint.progress, progressRouter);
app.use(errorHandler);
const httpServer = createServer(app);

const io = new Server(httpServer);
socket(io);
httpServer.listen(port, async () => {
  try {
    await sequelize.authenticate().then(() => {
      console.log("DB sequelize connection success");
    });
    console.log(`Server listening on port: ${port}`);
  } catch (err) {
    console.error(err);
    console.log("Server running failed");
  }
});
