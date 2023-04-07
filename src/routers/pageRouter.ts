import { Router } from "express";
import { pageController } from "../controllers";
import { asyncHandler } from "../utils/asyncHandler";
import { DtoValidatorMiddleware } from "../middlewares";
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
pageRouter.get("/room/:id", asyncHandler(pageController.getChat));
pageRouter.put(
  "/:id",
  DtoValidatorMiddleware(PageDto),
  asyncHandler(pageController.pushBlock)
);
pageRouter.delete(
  "/:id",
  DtoValidatorMiddleware(PageDto),
  asyncHandler(pageController.deletePage)
);
