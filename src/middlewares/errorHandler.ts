import { ErrorType } from "../constants";
import { ErrorRequestHandler } from "express";
import { errorResponse, logger } from "../utils";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error(err.stack);
  errorResponse(res, ErrorType.BADREQUEST, err.message);
};
