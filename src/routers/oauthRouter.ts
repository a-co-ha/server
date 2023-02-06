import express from "express";
import { Request, Response, NextFunction } from 'express';
import { request } from "http";
import passport from "passport";
import { userController } from "../controllers";
import { userService } from "../services";
import { asyncHandler } from "../utils";
import { setUserToken } from "../utils/jwt";
export const oauthRouter = express.Router();

oauthRouter.get("/github", passport.authenticate("github"));
oauthRouter.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  asyncHandler(userController.login)

);
