import express from "express";

import { githubController } from "../controllers";
import { loginRequired } from "../middlewares";
import { asyncHandler } from "../utils";

export const githubRouter = express.Router();
githubRouter.post("/repos", asyncHandler(githubController.getRepos));

githubRouter.post("/repo", asyncHandler(githubController.getRepo));
githubRouter.post("/commits", asyncHandler(githubController.getCommits));
githubRouter.post(
  "/orgs",
  loginRequired,
  asyncHandler(githubController.getOrgs)
);
githubRouter.post("/org", loginRequired, asyncHandler(githubController.getOrg));
githubRouter.post("/issue", asyncHandler(githubController.getIssue));
githubRouter.post(
  "/org/issue/comments",
  asyncHandler(githubController.getIssueDetail)
);
githubRouter.post("/org/issue", asyncHandler(githubController.createIssue));
