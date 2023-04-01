import express from "express";
import { ChannelController } from "../controllers/channelController";
import { asyncHandler } from "../utils";

export function channelRouter(
  channelController: ChannelController
): express.Router {
  const router = express.Router();

  router.post("/create", asyncHandler(channelController.create));
  router.post("/:adminCode", asyncHandler(channelController.join));
  router.delete("/admin", asyncHandler(channelController.delete));
  router.delete("/exit", asyncHandler(channelController.channelExit));
  router.get("/users", asyncHandler(channelController.getUsers));

  return router;
}
