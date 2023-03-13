import express from "express";
import { asyncHandler } from "../utils";
const { body } = require("express-validator");
import { channelController } from "../controllers";

export const channelRouter = express.Router();

channelRouter.post(
  "/create",
  body("channelName").not().isEmpty(),
  asyncHandler(channelController.create)
);
channelRouter.post("/:admin", asyncHandler(channelController.join));
