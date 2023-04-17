import { Router } from "express";
import { templateController } from "../controllers";
import { asyncHandler } from "../utils/asyncHandler";
import { cascade } from "../middlewares";
import { DtoValidatorMiddleware } from "../middlewares";
import { TemplateDto } from "../dto";
export const templateRouter = Router();

templateRouter.post(
  "/",
  DtoValidatorMiddleware(TemplateDto),
  asyncHandler(templateController.createTemplate)
);
templateRouter.patch(
  "/:id",
  DtoValidatorMiddleware(TemplateDto),
  asyncHandler(templateController.addTemplatePage)
);
templateRouter.patch(
  "/update/:id",
  DtoValidatorMiddleware(TemplateDto),
  asyncHandler(templateController.updateTemplate)
);
templateRouter.delete(
  "/:id",
  DtoValidatorMiddleware(TemplateDto),
  cascade,
  asyncHandler(templateController.deleteTemplate)
);
templateRouter.get(
  "/percentage/:id",
  DtoValidatorMiddleware(TemplateDto),
  asyncHandler(templateController.percentageProgress)
);
