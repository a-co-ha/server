import express from "express";
import { githubController } from "../controllers";
import { asyncHandler } from "../utils";

export const githubRouter = express.Router();
githubRouter.post("/repos", asyncHandler(githubController.getRepos));
githubRouter.post("/repo", asyncHandler(githubController.getRepo));
githubRouter.post("/orgs", asyncHandler(githubController.getOrgs));
githubRouter.post("/org", asyncHandler(githubController.getOrg));
githubRouter.post("/commits", asyncHandler(githubController.getCommits));
githubRouter.post("/issue", asyncHandler(githubController.getIssue));
githubRouter.post(
  "/org/issue/comments",
  asyncHandler(githubController.getIssueDetail)
);
