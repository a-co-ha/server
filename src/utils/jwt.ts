import jwt, { Secret } from "jsonwebtoken";
import { jwtSecret } from "../config";
import { decode, errorHandler } from "../middlewares";
import { errorResponse } from "./errorResponse";
import { redisCli } from "./redisClient";

export const setUserToken = (user: any) => {
  const accessToken = jwt.sign(user, jwtSecret as Secret, {
    expiresIn: "24h",
  });
  const refreshToken = jwt.sign(user, jwtSecret as Secret, {
    expiresIn: "14d",
  });
  return { accessToken, refreshToken };
};


export const getAccessToken = async (refreshToken) => {
  const user = await decode(refreshToken);
const refresh = await redisCli.get(`token:${user.userId}`);
if (refresh !== refreshToken){
throw new Error ("invalidate token");
}
const newAcessToken = jwt.sign(user, jwtSecret as Secret, {
    expiresIn: "24h",
  });

return {getAccessToken : newAcessToken, refreshToken}
}