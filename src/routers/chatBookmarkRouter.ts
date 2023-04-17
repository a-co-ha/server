import express from "express";
import { asyncHandler } from "../utils";
import { chatBookmarkController } from "../controllers";

export const bookmarkRouter = express.Router();

bookmarkRouter.post("/", asyncHandler(chatBookmarkController.createBookmark));
bookmarkRouter.get("/:id", asyncHandler(chatBookmarkController.findBookmark));
bookmarkRouter.patch(
  "/:id",
  asyncHandler(chatBookmarkController.updateBookmark)
);
bookmarkRouter.delete(
  "/:id",
  asyncHandler(chatBookmarkController.deleteBookmark)
);
