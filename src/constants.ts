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
  announcements: string;
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
  announcements: "/api/announcements",
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
  "User-Agent": "request",
};

export const enum ENCTYPE {
  BASE64 = "base64",
  UTF8 = "utf-8",
}
export const dateFormat = "YY-MM-DD HH:mm:ss";

export const enum REDIS_TTL {
  DAY = 86400,
}

export const enum PAGE_NAME {
  DEFAULT = "제목 없음",
}

export const enum PAGE_TYPE {
  SOCKET = "socket",
  PAGE = "page",
  TEMPLATE = "template",
  NORMAL = "normal",
  PROGRESSIVE = "progress-page",
  NORMALIZE = "normal-page",
  TEMPLATE_PROGRESSIVE = "template-progress",
  TEMPLATE_NORMAL = "template-normal",
}

export const enum PAGE_BLOCK {
  TAG_DEFAULT = "p",
  DEFAULT = "",
}

export const enum TEMPLATE_STATUS {
  TODO = "todo",
  COMPLETE = "complete",
  DEFAULT = "null",
}

export const enum ERROR_NAME {
  NOT_FOUND_CHANNEL = "채널이 없습니다.",
  NOT_FOUND_PROGRESS_STATUS = "progressStatus를 입력하세요.",
  TEMPLATE_TYPE_ERROR = "진행현황 템플릿이 아닙니다.",
  ANNOUNCEMENTS_NOT_AN_AUTHOR = "작성자가 아닙니다.",
  ANNOUNCEMENTS_NOT_EXIST = "해당 공지사항은 존재하지 않습니다.",
}

export const enum gitHubType {
  ORG = "org",
  REPO = "repo",
}
