import { Router } from "express";
import { postController } from "../controllers";
import { asyncHandler } from "../utils/asyncHandler";
import {
  deleteS3ImageMiddleware,
  imageUpload,
} from "../middlewares/imageUpload";
export const postRouter = Router();

postRouter.get("/:id", asyncHandler(postController.findPost));
postRouter.post("/", asyncHandler(postController.createPost));
postRouter.put("/:id", asyncHandler(postController.pushPost));
postRouter.delete("/:id", asyncHandler(postController.deletePost));
postRouter.post(
  "/images",
  imageUpload.single("image"),
  asyncHandler(postController.imageUpload)
);
postRouter.get("/", asyncHandler(postController.findPageList));
postRouter.delete("/images/:id", deleteS3ImageMiddleware);
