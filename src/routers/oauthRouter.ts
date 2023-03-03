import express from "express";
import passport from "passport";
import { userController } from "../controllers";
import { asyncHandler } from "../utils";

export const oauthRouter = express.Router();

oauthRouter.post("/github", passport.authenticate("github"));
oauthRouter.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  asyncHandler(userController.login)
);
