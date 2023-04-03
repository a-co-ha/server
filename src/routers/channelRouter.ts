import { Router } from "express";
import { channelController } from "../controllers/channelController";
import { asyncHandler } from "../utils";

export const channelRouter = Router();

channelRouter.post("/create", asyncHandler(channelController.create));
channelRouter.post("/:adminCode", asyncHandler(channelController.join));
channelRouter.delete("/admin", asyncHandler(channelController.delete));
channelRouter.delete("/exit", asyncHandler(channelController.channelExit));
channelRouter.get("/users", asyncHandler(channelController.getUsers));
