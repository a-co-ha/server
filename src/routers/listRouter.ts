import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { listController } from "../controllers";
export const listRouter = Router();

listRouter.post("/", asyncHandler(listController.createList));
listRouter.get("/", asyncHandler(listController.findList));
listRouter.patch("/", asyncHandler(listController.updateList));
listRouter.delete("/:id", asyncHandler(listController.deleteListOne));
