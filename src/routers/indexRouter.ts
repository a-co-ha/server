import express from "express";
import { ResultWithContext } from "express-validator/src/chain";
import passport from "passport";
import { userController } from "../controllers";
import { asyncHandler } from "../utils";

export const indexRouter = express.Router();

indexRouter.get("/", asyncHandler(userController.login));
// indexRouter.get("/", async (req, res, next) => {
//   if (!req.isAuthenticated()) {
//     throw new Error("Authentication is required");
//   }
//   console.log(req.user);
//
// });
