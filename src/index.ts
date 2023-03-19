import { socketMiddleware } from "./middlewares/io";
import crypto from "crypto";
import redisCache from "./utils/redisCache";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import logger from "morgan";
import session from "express-session";
import cluster from "cluster";
import { port, mongoDBUri, sessionConfig, SESSION_SECRET } from "./config";
import {
  indexRouter,
  oauthRouter,
  channelRouter,
  pageRouter,
  socket,
  templateRouter,
  userRouter,
  listRouter,
} from "./routers";
import { endPoint } from "./constants";
import passport from "passport";
import { decode, errorHandler, loginRequired, wrap } from "./middlewares";
import { init } from "./db/mysql";
import { createServer } from "http";
import { Server } from "socket.io";
import { sequelize } from "./model";
import { createAdapter } from "@socket.io/redis-adapter";

import { redisClient, subClient } from "./utils/redisClient";
// const WORKERS_COUNT = require("os").cpus().length;
// const WORKERS_COUNT = 4;

// if (cluster.isPrimary) {
//   console.log(`Master ${process.pid} is running`);

//   for (let i = 0; i < WORKERS_COUNT; i++) {
//     cluster.fork();
//   }

//   cluster.on("exit", (worker) => {
//     console.log(`Worker ${worker.process.pid} died`);
//     cluster.fork();
//   });
// } else {
//   console.log(`Worker ${process.pid} started`);

const app = express(); // export const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {},
});

Promise.all([redisClient, subClient]).then(() => {
  io.adapter(createAdapter(redisClient, subClient));
});

const sessionMiddleware = session(sessionConfig);

mongoose.set("strictQuery", true);
mongoose.connect(mongoDBUri);
mongoose.connection.on("connected", () => {
  console.log(`Successfully connected to MongoDB: ${mongoDBUri}`);
});

init();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(SESSION_SECRET));

app.use(sessionMiddleware);

app.get(endPoint.index, indexRouter);
app.use(endPoint.oauth, oauthRouter);
app.use(endPoint.user, loginRequired, userRouter);
app.use(endPoint.channel, loginRequired, channelRouter);
app.use(endPoint.page, pageRouter);
app.use(endPoint.template, templateRouter);
app.use(endPoint.list, listRouter);
app.use(errorHandler);

io.use(wrap(sessionMiddleware));

io.use(socketMiddleware);

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
// }
