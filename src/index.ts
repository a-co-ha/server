const { setupMaster, setupWorker } = require("@socket.io/sticky");
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import logger from "morgan";
import session from "express-session";
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
import { errorHandler, loginRequired } from "./middlewares";
import { init } from "./db/mysql";
import { createServer } from "http";
import { Server } from "socket.io";
import { sequelize } from "./model";

export const app = express();
const sessionMiddleware = session(sessionConfig);
// convert a connect middleware to a Socket.IO middleware
const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

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
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(SESSION_SECRET));
app.use(sessionMiddleware);

app.use(passport.initialize());
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
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

import crypto from "crypto";

const randomId = () => crypto.randomBytes(8).toString("hex");

io.use((socket: any, next) => {
  // const sessionID = socket.handshake.auth.sessionID;
  // if (sessionID) {
  // const session = await sessionStore.findSession(sessionID);
  // if (session) {
  //   socket.sessionID = sessionID;
  //   socket.userID = session.userID;
  //   socket.username = session.username;
  //   return next();
  // }
  // }
  const username = socket.handshake.headers.username;
  // if (!username) {
  //   return next(new Error("invalid username"));
  // }
  socket.sessionID = randomId();
  socket.userID = randomId();
  socket.username = username;

  next();
});

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
