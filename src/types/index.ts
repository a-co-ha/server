import { UserAttributes } from "../interface/userInterface";
import { Request, Response, NextFunction } from "express";
import "express-session";
import "express";

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<any>;

export enum ErrorType {
  FORBIDDEN,
  NOTFOUND,
  BADREQUEST,
  SERVERERROR,
}

export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
}

export enum LogColor {
  INFO = "\x1b[35m%s\x1b[0m", // magenta
  ERROR = "\x1b[33m%s\x1b[0m", // yellow
}

declare global {
  namespace Express {
    interface Request {
      user?: UserAttributes;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userId: number;
    auth: boolean;
  }
}

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        location: string;
      }
    }
  }
}
