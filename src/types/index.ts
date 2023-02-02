import { Request, Response, NextFunction } from "express";

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<any>;

export type ErrorType = "FORBIDDEN" | "NOTFOUND" | "SERVERERROR" | "BADREQUEST";
