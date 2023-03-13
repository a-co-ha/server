import { Router } from "express";
import { postController } from "../controllers";
import { asyncHandler } from "../utils/asyncHandler";
export const postRouter = Router();

postRouter.get("/:id", asyncHandler(postController.findPost));
postRouter.post("/", asyncHandler(postController.createPost));
postRouter.put("/:id", asyncHandler(postController.pushPost));
postRouter.delete("/:id", asyncHandler(postController.deletePost));
