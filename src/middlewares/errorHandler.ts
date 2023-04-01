import { LogColor, ErrorType } from "../constants";
import { ErrorRequestHandler } from "express";
import { errorResponse } from "../utils";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(LogColor.ERROR, err.stack);
  errorResponse(res, ErrorType.BADREQUEST, err.message);
};
