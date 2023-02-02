import express from "express";
import { githubLoginPage, githubLoginWithServer } from "../controllers";

export const oauthRouter = express.Router();

oauthRouter.get("/github", githubLoginPage);
oauthRouter.get("/github/callback", githubLoginWithServer);
