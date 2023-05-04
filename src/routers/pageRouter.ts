import { Router } from "express";
import { messageController, pageController } from "../controllers";
import { asyncHandler } from "../utils/asyncHandler";
import { DtoValidatorMiddleware, loginRequired } from "../middlewares";
import { PageDto } from "../dto";
export const pageRouter = Router();

pageRouter.get(
  "/:id",
  DtoValidatorMiddleware(PageDto),
  asyncHandler(pageController.findPage)
);
pageRouter.post(
  "/",
  DtoValidatorMiddleware(PageDto),
  asyncHandler(pageController.createPage)
);
pageRouter.post(
  "/room",
  DtoValidatorMiddleware(PageDto),
  asyncHandler(pageController.createRoom)
);
pageRouter.get(
  "/room/:id",
  loginRequired,
  asyncHandler(messageController.getMessage)
);
pageRouter.put(
  "/:id",
  DtoValidatorMiddleware(PageDto),
  asyncHandler(pageController.putBlockInEditablePage)
);
pageRouter.put(
  "/room/:id",
  DtoValidatorMiddleware(PageDto),
  asyncHandler(pageController.editRoomName)
);
pageRouter.delete(
  "/:id",
  DtoValidatorMiddleware(PageDto),
  asyncHandler(pageController.deletePage)
);

pageRouter.get(
  "/search/:channel",
  DtoValidatorMiddleware(PageDto),
  asyncHandler(pageController.pageAndTemplateSearch)
);
