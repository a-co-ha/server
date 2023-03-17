import express from "express";
import { asyncHandler } from "../utils";
const { body } = require("express-validator");
import { channelController } from "../controllers";
import { query } from "express-validator";

export const channelRouter = express.Router();

channelRouter.post(
  "/create",
  body("channelName").not().isEmpty(),
  asyncHandler(channelController.create)
);
channelRouter.post(
  "/:adminCode",
  query("channelCode").isString(),
  asyncHandler(channelController.join)
);
