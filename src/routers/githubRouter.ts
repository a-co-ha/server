import express from "express";

import { githubController, userController } from "../controllers";
import { asyncHandler } from "../utils";

export const githubRouter = express.Router();
githubRouter.get("/org", asyncHandler(githubController.getOrg));
githubRouter.get("/org/events", asyncHandler(githubController.getEvents));
githubRouter.get("/org/issue", asyncHandler(githubController.getIssue));
githubRouter.get(
  "/org/issue/comments",
  asyncHandler(githubController.getIssueDetail)
);
githubRouter.post("/org/issue", asyncHandler(githubController.createIssue));
