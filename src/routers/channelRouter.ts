import express from "express";
import { asyncHandler } from "../utils";

import { channelController } from "../controllers";

export const channelRouter = express.Router();

channelRouter.post("/create", asyncHandler(channelController.create));
channelRouter.post("/:admin", asyncHandler(channelController.join));
