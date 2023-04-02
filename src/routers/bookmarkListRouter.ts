import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { bookmarkListController } from "../controllers";
export const bookmarkListRouter = Router();

bookmarkListRouter.post("/", asyncHandler(bookmarkListController.createList));
