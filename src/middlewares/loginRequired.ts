import { ErrorType, TokenType } from "../constants";
import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils";
import { jwtSecret } from "../config";
import jwt from "jsonwebtoken";
import { User } from "../interface";

export async function loginRequired(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const tokenType = req.headers.authorization?.split(" ")[0];
  const token = req.headers.authorization?.split(" ")[1];

  if (!(tokenType === TokenType.ACCESS || tokenType === TokenType.REFRESH)) {
    errorResponse(res, ErrorType.FORBIDDEN, "정상적인 토큰이 아닙니다. ");
    return;
  }

  if (!token || token === "null") {
    errorResponse(
      res,
      ErrorType.FORBIDDEN,
      "로그인한 유저만 사용할 수 있습니다. "
    );
    return;
  }

  try {
    const decoded = await decode(token);

    req.user = decoded;

    next();
  } catch (error: any) {
    errorResponse(res, ErrorType.FORBIDDEN, error);
    return;
  }
}

export async function decode(token: string): Promise<User> {
  const jwtDecoded = jwt.verify(token, jwtSecret);

  const userId = (<{ userId: number }>jwtDecoded).userId;
  const githubID = (<{ githubID: string }>jwtDecoded).githubID;
  const name = (<{ name: string }>jwtDecoded).name ?? githubID;
  const githubURL = (<{ githubURL: string }>jwtDecoded).githubURL;
  const img = (<{ img: string }>jwtDecoded).img;

  return { userId, name, githubID, githubURL, img };
}
