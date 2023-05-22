import { Router } from "express";
import { channelController } from "../controllers";
import { ChannelDto } from "../dto";
import { DtoValidatorMiddleware, imageUpload } from "../middlewares";
import { asyncHandler } from "../utils";
export const channelRouter = Router();

channelRouter.post(
  "/create",
  DtoValidatorMiddleware(ChannelDto),
  asyncHandler(channelController.createChannel)
);
channelRouter.post(
  "/:adminCode",
  DtoValidatorMiddleware(ChannelDto),
  asyncHandler(channelController.joinChannel)
);
channelRouter.delete(
  "/admin",
  DtoValidatorMiddleware(ChannelDto),
  asyncHandler(channelController.deleteChannel)
);
channelRouter.delete(
  "/exit",
  DtoValidatorMiddleware(ChannelDto),
  asyncHandler(channelController.exitChannel)
);
channelRouter.get(
  "/users",
  DtoValidatorMiddleware(ChannelDto),
  asyncHandler(channelController.getUsers)
);
channelRouter.patch(
  "/imageUpdate",
  imageUpload.single("channelImg"),
  DtoValidatorMiddleware(ChannelDto),
  asyncHandler(channelController.channelImagUpdate)
);
channelRouter.patch(
  "/nameUpdate",
  DtoValidatorMiddleware(ChannelDto),
  asyncHandler(channelController.channelNameUpdate)
);
