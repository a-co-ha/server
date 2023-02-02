import { Response } from "express";
import { ErrorType } from "../types";

export const errorResponse = (
  res: Response,
  type: ErrorType,
  message?: string
) => {
  let statusCode: number = 500;
  switch (type) {
    case "FORBIDDEN":
      statusCode = 403;
      break;
    case "NOTFOUND":
      statusCode = 404;
      break;
    case "BADREQUEST":
      statusCode = 400;
      break;
    case "SERVERERROR":
      statusCode = 500;
      break;
    default:
      break;
  }

  res.status(statusCode).json({ message });
};
