import { Request, Response, NextFunction } from "express";
import { connectSocket } from "../utils/connectSocket";

export const indexRouter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.send("welcome!");
};
