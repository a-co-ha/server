import { Response } from "express";
import { ErrorType } from "../types";

export const errorResponse = (
  res: Response,
  type: ErrorType,
  message?: string
) => {
  let statusCode: number = 500;
  switch (type) {
    case ErrorType.FORBIDDEN:
      statusCode = 403;
      break;
    case ErrorType.NOTFOUND:
      statusCode = 404;
      break;
    case ErrorType.BADREQUEST:
      statusCode = 400;
      break;
    case ErrorType.SERVERERROR:
      statusCode = 500;
      break;
    default:
      break;
  }

  res.status(statusCode).json({ message });
};
