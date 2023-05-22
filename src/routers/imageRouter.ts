import { Router } from "express";
import { imageController } from "../controllers";
import { asyncHandler } from "../utils";
import { imageUpload } from "../middlewares";
export const imageRouter = Router();

imageRouter.post(
  "/upload",
  imageUpload.single("image"),
  asyncHandler(imageController.imageUpload)
);
imageRouter.post("/delete", asyncHandler(imageController.imageDelete));
