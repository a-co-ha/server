/* eslint-disable no-prototype-builtins */
import { plainToClass, plainToInstance } from "class-transformer";
import { validateOrReject, ValidationError, validate } from "class-validator";
import { NextFunction, Request, Response } from "express";

export const DtoValidatorMiddleware = (
  type: any,
  skipMissingProperties = false
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const fileDto: any = plainToClass(type, { channelImg: req.file });
    console.log(fileDto);

    for (const key in fileDto) {
      if (fileDto.hasOwnProperty(key) && fileDto[key] === undefined) {
        delete fileDto[key];
      }
    }
    validateOrReject(fileDto, { skipMissingProperties })
      .then(() => {
        const paramDto: any = plainToClass(type, req.params, {});

        for (const key in paramDto) {
          if (paramDto.hasOwnProperty(key) && paramDto[key] === undefined) {
            delete paramDto[key];
          }
        }
        validateOrReject(paramDto, { skipMissingProperties })
          .then(() => {
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
                  if (
                    bodyDto.hasOwnProperty(key) &&
                    bodyDto[key] === undefined
                  ) {
                    delete bodyDto[key];
                  }
                }
                validateOrReject(bodyDto, { skipMissingProperties })
                  .then(() => {
                    req.body = Object.assign(
                      {},
                      req.body,
                      { ...queryDto },
                      { ...paramDto },
                      { ...fileDto }
                    );

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
      .catch((errors: any) => {
        const errorsMessageArray: string[] = [];
        for (const key in errors) {
          if (errors.hasOwnProperty(key)) {
            const error = errors[key];
            errorsMessageArray.push(
              ...(Object as any).values(error.constraints)
            );
          }
        }
        return res.status(400).json({
          message: errorsMessageArray,
        });
      });
  };
};
