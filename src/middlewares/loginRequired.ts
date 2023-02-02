import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils";

export function loginRequired(req: Request, res: Response, next: NextFunction) {
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
    const secretKey = process.env.JWT_SECRET_KEY || "secret-key";
    // const jwtDecoded = jwt.verify(userToken, secretKey);
    next();
  } catch (error) {
    errorResponse(res, "FORBIDDEN", "정상적인 토큰이 아닙니다.");

    return;
  }
}
