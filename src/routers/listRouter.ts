import { Router } from "express";
import { asyncHandler } from "../utils";
import { listController } from "../controllers";
import { DtoValidatorMiddleware } from "../middlewares";
import { ListDto } from "../dto";
export const listRouter = Router();

listRouter.get(
  "/",
  DtoValidatorMiddleware(ListDto),
  asyncHandler(listController.findList)
);
listRouter.patch(
  "/",
  DtoValidatorMiddleware(ListDto),
  asyncHandler(listController.updateList)
);
listRouter.delete(
  "/:id",
  DtoValidatorMiddleware(ListDto),
  asyncHandler(listController.deleteListOne)
);
