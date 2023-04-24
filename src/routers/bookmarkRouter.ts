import { Router } from "express";
import { asyncHandler } from "../utils";
import { bookmarkController } from "../controllers";
import { BookMarkDto } from "../dto";
import { DtoValidatorMiddleware } from "../middlewares";

export const bookmarkRouter = Router();

bookmarkRouter.get(
  "/:bookmarkId",
  DtoValidatorMiddleware(BookMarkDto),
  asyncHandler(bookmarkController.getBookmark)
);

bookmarkRouter.patch(
  "/:bookmarkId",
  DtoValidatorMiddleware(BookMarkDto),
  asyncHandler(bookmarkController.updateBookmark)
);
bookmarkRouter.delete(
  "/:bookmarkId",
  DtoValidatorMiddleware(BookMarkDto),
  asyncHandler(bookmarkController.deleteBookmark)
);

export const bookmarkListRouter = Router();

bookmarkListRouter.get(
  "/:roomId",
  DtoValidatorMiddleware(BookMarkDto),
  asyncHandler(bookmarkController.getBookmarkList)
);

bookmarkListRouter.patch(
  "/:roomId",
  DtoValidatorMiddleware(BookMarkDto),
  asyncHandler(bookmarkController.updateBookmarkList)
);
