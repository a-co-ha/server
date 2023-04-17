import { LogColor, ErrorType } from "../constants";
import { ErrorRequestHandler } from "express";
import { errorResponse } from "../utils";
import { logger } from "../utils/winston";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error(err.stack);
  errorResponse(res, ErrorType.BADREQUEST, err.message);
};
