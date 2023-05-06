import express from "express";

import { githubController } from "../controllers";
import { loginRequired } from "../middlewares";
import { asyncHandler } from "../utils";

export const githubRouter = express.Router();
githubRouter.post("/repo", asyncHandler(githubController.getRepo));
githubRouter.post("/repos", asyncHandler(githubController.getRepos));
githubRouter.post("/org", loginRequired, asyncHandler(githubController.getOrg));
githubRouter.post("/org/events", asyncHandler(githubController.getEvents));
githubRouter.post("/org/issue", asyncHandler(githubController.getIssue));
githubRouter.post(
  "/org/issue/comments",
  asyncHandler(githubController.getIssueDetail)
);
githubRouter.post("/org/issue", asyncHandler(githubController.createIssue));
