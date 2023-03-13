import { Router } from "express";
import { progressController } from "../controllers";
import { asyncHandler } from "../utils/asyncHandler";
import { progressCascade } from "../middlewares";
export const progressRouter = Router();

progressRouter.post("/", asyncHandler(progressController.createProgress));
progressRouter.get("/:id", asyncHandler(progressController.findProgress));
progressRouter.patch("/:id", asyncHandler(progressController.addProgress));
progressRouter.patch(
  "/update/:id",
  asyncHandler(progressController.updateProgress)
);
progressRouter.delete(
  "/:id",
  progressCascade,
  asyncHandler(progressController.deleteProgress)
);
progressRouter.get(
  "/percentage/:id",
  asyncHandler(progressController.percentageProgress)
);
