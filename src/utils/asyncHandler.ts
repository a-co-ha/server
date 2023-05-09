import { NextFunction, Request, Response } from "express";

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<any>;

export const asyncHandler = (asyncHandlerArgFunc: AsyncRequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await asyncHandlerArgFunc(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
