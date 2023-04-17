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
userRouter.post("/logout", asyncHandler(userController.logout));
