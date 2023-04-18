/* eslint-disable no-prototype-builtins */
import { plainToClass, plainToInstance } from "class-transformer";
import { validateOrReject, ValidationError, validate } from "class-validator";
import { NextFunction, Request, Response } from "express";

const validateDTO = async (dto: any) => {
  for (const key in dto) {
    if (dto.hasOwnProperty(key) && dto[key] === undefined) {
      delete dto[key];
    }
  }
  await validateOrReject(dto, { skipMissingProperties: false });
  return dto;
};

export const DtoValidatorMiddleware = (type: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [fileDto, paramDto, queryDto, bodyDto] = await Promise.all([
        validateDTO(plainToClass(type, { channelImg: req.file })),
        validateDTO(plainToClass(type, req.params, {})),
        validateDTO(plainToClass(type, req.query, {})),
        validateDTO(plainToInstance(type, req.body)),
      ]);

      req.body = Object.assign(
        {},
        { ...bodyDto },
        { ...queryDto },
        { ...paramDto },
        { ...fileDto }
      );
      next();
    } catch (errors: any) {
      const errorsMessageArray: string[] = [];
      if (Array.isArray(errors)) {
        errors.forEach((validationError: ValidationError) => {
          errorsMessageArray.push(
            ...Object.values(validationError.constraints)
          );
        });
      } else {
        errorsMessageArray.push(errors.message);
      }
      return res.status(400).json({
        message: errorsMessageArray,
      });
    }
  };
};
