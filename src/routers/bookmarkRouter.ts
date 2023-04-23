import { Router } from "express";
import { asyncHandler } from "../utils";
import { bookmarkController } from "../controllers";

export const bookmarkRouter = Router();

bookmarkRouter.get(
  "/:bookmarkId",
  asyncHandler(bookmarkController.findBookmark)
);

bookmarkRouter.patch(
  "/:bookmarkId",
  asyncHandler(bookmarkController.updateBookmark)
);
bookmarkRouter.delete(
  "/:bookmarkId",
  asyncHandler(bookmarkController.deleteBookmark)
);

export const bookmarkListRouter = Router();

bookmarkListRouter.get(
  "/:roomId",
  asyncHandler(bookmarkController.getBookmarkList)
);

bookmarkListRouter.patch(
  "/:roomId",
  asyncHandler(bookmarkController.updateBookmarkList)
);
