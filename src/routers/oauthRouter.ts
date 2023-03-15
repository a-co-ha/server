import { githubLogin } from "./../middlewares/login";
import express from "express";

import { userController } from "../controllers";
import { asyncHandler } from "../utils";
export const oauthRouter = express.Router();
oauthRouter.get(
  "/github/callback",
  githubLogin,
  asyncHandler(userController.login)
);
