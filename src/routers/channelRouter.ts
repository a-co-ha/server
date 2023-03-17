import express from "express";
import { asyncHandler } from "../utils";
import { channelController } from "../controllers";
import { DtoValidatorMiddleware } from "../middlewares";
import { ChannelDto } from "../dto/channelDto";

export const channelRouter = express.Router();

channelRouter.post(
  "/create",
  DtoValidatorMiddleware(ChannelDto),
  asyncHandler(channelController.create)
);
channelRouter.post(
  "/:adminCode",
  DtoValidatorMiddleware(ChannelDto),
  asyncHandler(channelController.join)
);
