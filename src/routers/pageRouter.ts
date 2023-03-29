import { Router } from "express";
import { pageController } from "../controllers";
import { asyncHandler } from "../utils/asyncHandler";
import { imageUpload, deleteImage } from "../middlewares/imageUpload";
export const pageRouter = Router();

pageRouter.get("/:id", asyncHandler(pageController.findPage));
pageRouter.post("/", asyncHandler(pageController.createPage));
pageRouter.put("/:id", asyncHandler(pageController.pushPage));
pageRouter.delete("/:id", asyncHandler(pageController.deletePage));
pageRouter.post(
  "/images",
  imageUpload.single("image"),
  asyncHandler(pageController.imageUpload)
);
pageRouter.post("/images/delete", asyncHandler(pageController.imageDelete));
