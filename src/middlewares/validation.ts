import { plainToInstance } from "class-transformer";
import { validateOrReject, ValidationError } from "class-validator";
import { NextFunction, Request, Response } from "express";

export const DtoValidatorMiddleware = (
  type: any,
  skipMissingProperties = false
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(type, req.body);
    validateOrReject(dto, { skipMissingProperties })
      .then(() => {
        req.body = dto;
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
  };
};
