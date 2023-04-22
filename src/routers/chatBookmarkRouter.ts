import { Router } from "express";
import { asyncHandler } from "../utils";
import { chatBookmarkController } from "../controllers";

export const bookmarkRouter = Router();

bookmarkRouter.get(
  "/:bookmarkId",
  asyncHandler(chatBookmarkController.findBookmark)
);

bookmarkRouter.patch(
  "/:bookmarkId",
  asyncHandler(chatBookmarkController.updateBookmark)
);
bookmarkRouter.delete(
  "/:bookmarkId",
  asyncHandler(chatBookmarkController.deleteBookmark)
);

export const bookmarkListRouter = Router();

bookmarkListRouter.get(
  "/:roomId",
  asyncHandler(chatBookmarkController.getBookmarkList)
);
bookmarkListRouter.patch(
  "/:roomId",
  asyncHandler(chatBookmarkController.updateBookmarkList)
);
