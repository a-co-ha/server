import { Request, Response, NextFunction } from "express";

interface EndPointInterface {
  index: string;
  invite: string;
  oauth: string;
  channel: string;
  user: string;
  guest: string;
  page: string;
  template: string;
  list: string;
  github: string;
}

export const endPoint: EndPointInterface = {
  index: "/",
  invite: "/invite",
  oauth: "/api/oauth",
  channel: "/api/channel",
  user: "/api/user",
  guest: "/api/guest",
  page: "/api/page",
  template: "/api/template",
  list: "/api/list",
  github: "/api/github",
};

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
