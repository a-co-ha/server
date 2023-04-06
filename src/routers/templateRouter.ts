import { Router } from "express";
import { templateController } from "../controllers";
import { asyncHandler } from "../utils/asyncHandler";
import { cascade } from "../middlewares";
export const templateRouter = Router();

templateRouter.post("/", asyncHandler(templateController.createTemplate));
templateRouter.patch("/:id", asyncHandler(templateController.addTemplatePage));
templateRouter.patch(
  "/update/:id",
  asyncHandler(templateController.updateTemplate)
);
templateRouter.delete(
  "/:id",
  cascade,
  asyncHandler(templateController.deleteTemplate)
);
templateRouter.get(
  "/percentage/:id",
  asyncHandler(templateController.percentageProgress)
);
