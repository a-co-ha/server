import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { bookmarkListController } from "../controllers";
export const bookmarkListRouter = Router();

bookmarkListRouter.post("/", asyncHandler(bookmarkListController.createList));
bookmarkListRouter.get(
  "/",
  asyncHandler(bookmarkListController.findBookmarkLsit)
);
bookmarkListRouter.patch(
  "/",
  asyncHandler(bookmarkListController.updateBookmarkList)
);
bookmarkListRouter.delete(
  "/",
  asyncHandler(bookmarkListController.deleteBookmarkList)
);
