import express from "express";
import { asyncHandler } from "../utils";
import { userController } from "../controllers";
import { loginRequired } from "../middlewares";

export const userRouter = express.Router();

userRouter.get("/", loginRequired, asyncHandler(userController.get));
userRouter.get(
  "/refresh",
  loginRequired,
  asyncHandler(userController.tokenRefresh)
);
// 로그아웃 나중에 포스트로 바꿀 것
userRouter.get("/logout", asyncHandler(userController.logout));
