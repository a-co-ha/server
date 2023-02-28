import express from "express";

import { inviteController } from "../controllers";

export const chatRouter = express.Router();

chatRouter.post("/", inviteController.invite);
chatRouter.post("/:code", inviteController.join);
