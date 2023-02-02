import express from "express";
import cors from "cors";
import createError from "http-errors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import logger from "morgan";

import { port, mongoDBUri, host } from "./config";
import { errorHandler, loginRequired } from "./middlewares";
// import { indexRouter, userRouter } from "./routers";
import { endPoint } from "./constants";

const app = express();
mongoose.connect(mongoDBUri);
mongoose.connection.on("connected", () => {
  console.log(`Successfully connected to MongoDB: ${mongoDBUri}`);
});

import mysql from "mysql2";

const pool = mysql.createPool({
  host: host,
  port: 3306,
  user: "admin",
  password: "12341234",
  database: "acoha",
});

export const getConn = async () => {
  return pool.getConnection(async (conn) => conn);
};

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.get(endPoint.index, indexRouter);
// app.use(endPoint.user, loginRequired, userRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(errorHandler);

getConn().then((conn) => {
  console.log(`Connected DB`);
});

app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});
