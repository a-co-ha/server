import { LogColor } from "./../types/index";
import { ErrorRequestHandler } from "express";
import { ErrorType } from "../types";
import { errorResponse } from "../utils";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(LogColor.ERROR, err.stack);
  errorResponse(res, ErrorType.BADREQUEST, err.message);
};
