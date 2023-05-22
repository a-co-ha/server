import { Request, Response, NextFunction } from "express";

export const indexRouter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.send("welcome!");
};
