import { Router } from "express";
import { calendarController } from "../controllers";
import { CalendarDto } from "../dto";
import { DtoValidatorMiddleware } from "../middlewares";
import { asyncHandler } from "../utils";

export const calendarRouter = Router();

calendarRouter.post(
  "/",
  DtoValidatorMiddleware(CalendarDto),
  asyncHandler(calendarController.createSchedule)
);

calendarRouter.get(
  "/schedule",
  DtoValidatorMiddleware(CalendarDto),
  asyncHandler(calendarController.findSchedulesByDate)
);

calendarRouter.get(
  "/",
  DtoValidatorMiddleware(CalendarDto),
  asyncHandler(calendarController.findSchedulesByChannel)
);

calendarRouter.delete(
  "/",
  DtoValidatorMiddleware(CalendarDto),
  asyncHandler(calendarController.deleteSchedules)
);
