import express from "express";

import { githubController, userController } from "../controllers";
import { asyncHandler } from "../utils";

export const githubRouter = express.Router();
githubRouter.post("/org", asyncHandler(githubController.getOrg));
githubRouter.post("/org/events", asyncHandler(githubController.getEvents));
githubRouter.post("/org/issue", asyncHandler(githubController.getIssue));
githubRouter.post(
  "/org/issue/comments",
  asyncHandler(githubController.getIssueDetail)
);
githubRouter.post("/org/issue", asyncHandler(githubController.createIssue));
