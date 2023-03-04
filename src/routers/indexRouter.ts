import { redisCli } from "./../utils/redisClient";
import { Request, Response, NextFunction, Router } from "express";
import { asyncHandler } from "../utils";

// export const indexRouter = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {

// };
export const indexRouter = Router();

indexRouter.get("/", async (req, res, next) => {
  await redisCli.set("name", "sh");
  await redisCli.expire("name", 3600); // 3600초 후에 username 키 삭제
});
