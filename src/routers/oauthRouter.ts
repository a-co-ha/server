import express from "express";
import { githubLoginPage, githubLoginWithServer } from "../controllers";
import passport from "passport";
export const oauthRouter = express.Router();

oauthRouter.get("/github", passport.authenticate("github"));
oauthRouter.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.

    res.redirect("/");
  }
);
