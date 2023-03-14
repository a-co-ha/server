import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils";
import { jwtSecret } from "../config";
import jwt from "jsonwebtoken";
export async function loginRequired(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userToken = req.headers.authorization?.split(" ")[1];
  if (!userToken || userToken === "null") {
    console.log("서비스 사용 요청이 있습니다.하지만, Authorization 토큰: 없음");
    errorResponse(
      res,
      "FORBIDDEN",
      "로그인한 유저만 사용할 수 있는 서비스입니다."
    );
    return;
  }

  try {
    const decoded = await decode(userToken);
    req.body.name = decoded.name;
    req.body.githubID = decoded.githubID;
    req.body.githubURL = decoded.githubURL;
    req.body.img = decoded.img;

    next();
  } catch (error) {
    errorResponse(res, "FORBIDDEN", "정상적인 토큰이 아닙니다.");

    return;
  }
}

export async function decode(userToken: string) {
  const jwtDecoded = jwt.verify(userToken, jwtSecret);
  const name = (<{ name: string }>jwtDecoded).name;
  const githubID = (<{ githubID: string }>jwtDecoded).githubID;
  const githubURL = (<{ githubURL: string }>jwtDecoded).githubURL;
  const img = (<{ img: string }>jwtDecoded).img;

  return { name, githubID, githubURL, img };
}
