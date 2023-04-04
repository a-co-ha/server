import { Router } from "express";
import { pageController } from "../controllers";
import { asyncHandler } from "../utils/asyncHandler";
export const pageRouter = Router();

pageRouter.get("/:id", asyncHandler(pageController.findPage));
pageRouter.post("/", asyncHandler(pageController.createPage));
pageRouter.post("/room", asyncHandler(pageController.createRoom));
pageRouter.get("/room/:id", asyncHandler(pageController.getChat));
pageRouter.put("/:id", asyncHandler(pageController.pushPage));
pageRouter.delete("/:id", asyncHandler(pageController.deletePage));
