import express from "express";
import { userController } from "../controllers";
import { loginRequired } from "../middlewares";
import { asyncHandler } from "../utils";

export const userRouter = express.Router();

userRouter.get("/", loginRequired, asyncHandler(userController.get));
userRouter.get(
  "/refresh",
  loginRequired,
  asyncHandler(userController.tokenRefresh)
);
userRouter.post("/logout", asyncHandler(userController.logout));
