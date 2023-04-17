import { Router } from "express";
import { channelController } from "../controllers/channelController";
import { asyncHandler } from "../utils";
import { imageUpload, deleteImage } from "../middlewares/imageUpload";
import { DtoValidatorMiddleware } from "../middlewares";
import { ChannelDto } from "../dto";
export const channelRouter = Router();

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
channelRouter.delete(
  "/admin",
  DtoValidatorMiddleware(ChannelDto),
  asyncHandler(channelController.delete)
);
channelRouter.delete(
  "/exit",
  DtoValidatorMiddleware(ChannelDto),
  asyncHandler(channelController.channelExit)
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
