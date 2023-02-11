import express from "express";

import { inviteController } from "../controllers";

export const inviteRouter = express.Router();

inviteRouter.post("/", inviteController.invite);
inviteRouter.post("/:code", inviteController.join);
