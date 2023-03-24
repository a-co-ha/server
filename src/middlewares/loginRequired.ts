import { ErrorType } from "./../types/index";
import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils";
import { jwtSecret } from "../config";
import jwt from "jsonwebtoken";
import { UserAttributes } from "../interface";
import { getAccessToken } from "../utils/jwt";
export async function loginRequired(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const accessToken = req.headers.authorization?.split(" ")[1];
  console.log(accessToken);
  const refreshToken = req.headers.refresh;
  if (!accessToken || accessToken === "null") {
    errorResponse(
      res,
      ErrorType.FORBIDDEN,
      "로그인한 유저만 사용할 수 있는 서비스입니다."
    );
    return;
  }

  try {
    const decoded = await decode(accessToken);

    req.body.userId = decoded.userId;
    req.body.name = decoded.name;
    req.body.githubID = decoded.githubID;
    req.body.githubURL = decoded.githubURL;
    req.body.img = decoded.img;

    next();

    
  } catch (error : any) {

    if (error.name === 'TokenExpiredError'){
     return await getAccessToken(refreshToken);
    }

    errorResponse(res, ErrorType.FORBIDDEN, error.name);

    return;
  }
}

export async function decode(token: string): Promise<UserAttributes> {
  const jwtDecoded = jwt.verify(token, jwtSecret);
  
  const userId = (<{ userId: number }>jwtDecoded).userId;
  const name = (<{ name: string }>jwtDecoded).name;
  const githubID = (<{ githubID: string }>jwtDecoded).githubID;
  const githubURL = (<{ githubURL: string }>jwtDecoded).githubURL;
  const img = (<{ img: string }>jwtDecoded).img;

  return { userId, name, githubID, githubURL, img };
}
