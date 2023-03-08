import { Router } from "express";
import { postController } from "../controllers";
import { asyncHandler } from "../utils/asyncHandler";
import { imageUpload } from "../middlewares/imageUpload";
export const postRouter = Router();

postRouter.get("/:id", asyncHandler(postController.findPost));
postRouter.post("/", asyncHandler(postController.createPost));
postRouter.put("/:id", asyncHandler(postController.pushPost));
postRouter.delete("/:id", asyncHandler(postController.deletePost));
postRouter.post(
  "/images/:id",
  imageUpload.single("image"),
  asyncHandler(postController.imageUpload)
);
