import express from "express";
import { asyncHandler } from "../utils";
import { userController } from "../controllers";

export const userRouter = express.Router();

userRouter.get("/", asyncHandler(userController.get));
userRouter.get("/refresh", asyncHandler(userController.tokenRefresh));