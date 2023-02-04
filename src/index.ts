import express from "express";
import cors from "cors";
import createError from "http-errors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import logger from "morgan";
import session from "express-session";
import { port, mongoDBUri, host } from "./config";
import { errorHandler, loginRequired } from "./middlewares";
import { indexRouter, oauthRouter } from "./routers";
import { endPoint } from "./constants";
import passport from "passport";

const app = express();
mongoose.connect(mongoDBUri);
mongoose.connection.on("connected", () => {
  console.log(`Successfully connected to MongoDB: ${mongoDBUri}`);
});

require("./routers/passport/github");
app.use(passport.initialize());



app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get(endPoint.index, indexRouter);
app.use(endPoint.oauth, oauthRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(errorHandler);



app. listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});
