import { Request, Response, NextFunction } from "express";
import { AsyncRequestHandler } from "../types";

export const asyncHandler = (asyncHandlerArgFunc: AsyncRequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await asyncHandlerArgFunc(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
