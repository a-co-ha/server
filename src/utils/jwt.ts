import jwt, { Secret } from "jsonwebtoken";
import { jwtSecret } from "../config";

export const setUserToken = (user: any) => {
  const accessToken = jwt.sign(user, jwtSecret as Secret, {
    expiresIn: "24h",
  });
  const refreshToken = jwt.sign(user, jwtSecret as Secret, {
    expiresIn: "14d",
  });
  return { accessToken, refreshToken };
};
