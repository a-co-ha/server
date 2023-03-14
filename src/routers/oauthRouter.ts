import { githubLogin } from "./../middlewares/login";
import { oauthClient, oauthSecret, oauthRedirect } from "../config";
import express from "express";
import passport, { use } from "passport";
import { userController } from "../controllers";
import { asyncHandler } from "../utils";
import axios from "axios";
import { UserAttributes } from "../interface";
import { userService } from "../services";
import { useContainer } from "class-validator";
export const oauthRouter = express.Router();
oauthRouter.get(
  "/github/callback",
  githubLogin,
  asyncHandler(userController.login)
);
