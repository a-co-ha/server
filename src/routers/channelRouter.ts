import express from "express";
import { asyncHandler } from "../utils";
import { channelController } from "../controllers";
import { DtoValidatorMiddleware } from "../middlewares";

export const channelRouter = express.Router();

channelRouter.post("/create", asyncHandler(channelController.create));
channelRouter.post("/:adminCode", asyncHandler(channelController.join));
channelRouter.delete("/admin", asyncHandler(channelController.delete));
channelRouter.delete("/exit", asyncHandler(channelController.channelExit));
channelRouter.get("/users", asyncHandler(channelController.getUsers));
