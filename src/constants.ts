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
  bookmark: string;
  image: string;
  bookmarks: string;
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
  bookmark: "/api/bookmark",
  image: "/api/image",
  bookmarks: "/api/bookmarks",
};

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

export const githubHeader = {
  Accept: "application/vnd.github.v3+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

export const decode = (
  target: string,
  encoding: BufferEncoding,
  format: BufferEncoding
): string => {
  return Buffer.from(target, encoding).toString(format);
};

export const enum ENCTYPE {
  BASE64 = "base64",
  UTF8 = "utf-8",
}
export const dateFormat = "YY-MM-DD HH:mm:ss";

export const enum REDIS_TTL {
  DAY = 86400,
}
