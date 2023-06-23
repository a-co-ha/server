import { Router } from "express";
import { announcementsController } from "../controllers";
import { AnnouncementsDto } from "../dto";
import { DtoValidatorMiddleware } from "../middlewares";
import { asyncHandler } from "../utils";

export const announcementsRouter = Router();

announcementsRouter.post(
  "/create",
  DtoValidatorMiddleware(AnnouncementsDto),
  asyncHandler(announcementsController.createAnnouncements)
);
announcementsRouter.get(
  "/:id",
  DtoValidatorMiddleware(AnnouncementsDto),
  asyncHandler(announcementsController.findOneAnnouncements)
);

announcementsRouter.get(
  "/",
  DtoValidatorMiddleware(AnnouncementsDto),
  asyncHandler(announcementsController.findAllAnnouncementsInChannel)
);

announcementsRouter.patch(
  "/:id",
  DtoValidatorMiddleware(AnnouncementsDto),
  asyncHandler(announcementsController.editAnnouncements)
);

announcementsRouter.delete(
  "/:id",
  DtoValidatorMiddleware(AnnouncementsDto),
  asyncHandler(announcementsController.deleteAnnouncements)
);
