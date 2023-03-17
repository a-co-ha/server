import express from "express";
import { asyncHandler } from "../utils";

import { githubController } from "../controllers";

export const githubRouter = express.Router();

githubRouter.get("/org", asyncHandler(githubController.getOrg));
githubRouter.get("/org/issues", asyncHandler(githubController.getIssue));
