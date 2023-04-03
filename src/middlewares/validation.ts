/* eslint-disable no-prototype-builtins */
import { plainToClass, plainToInstance } from "class-transformer";
import { validateOrReject, ValidationError, validate } from "class-validator";
import { NextFunction, Request, Response } from "express";

export const DtoValidatorMiddleware = (
  type: any,
  skipMissingProperties = false
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const queryDto: any = plainToClass(type, req.query);
    for (const key in queryDto) {
      if (queryDto.hasOwnProperty(key) && queryDto[key] === undefined) {
        delete queryDto[key];
      }
    }
    validateOrReject(queryDto, { skipMissingProperties })
      .then(() => {
        const bodyDto: any = plainToInstance(type, req.body);
        for (const key in bodyDto) {
          if (bodyDto.hasOwnProperty(key) && bodyDto[key] === undefined) {
            delete bodyDto[key];
          }
        }
        validateOrReject(bodyDto, { skipMissingProperties })
          .then(() => {
            req.body = Object.assign({}, req.body, { ...queryDto });
            next();
          })
          .catch((errors: ValidationError[]) => {
            const errorsMessageArray: string[] = [];
            errors.forEach((errors) => {
              errorsMessageArray.push(
                ...(Object as any).values(errors.constraints)
              );
            });
            return res.status(400).json({
              message: errorsMessageArray,
            });
          });
      })
      .catch((errors: ValidationError[]) => {
        const errorsMessageArray: string[] = [];
        errors.forEach((errors) => {
          errorsMessageArray.push(
            ...(Object as any).values(errors.constraints)
          );
        });
        return res.status(400).json({
          message: errorsMessageArray,
        });
      });
  };
};
