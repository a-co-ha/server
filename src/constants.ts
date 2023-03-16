interface EndPointInterface {
  index: string;
  oauth: string;
  channel: string;
  user: string;
  guest: string;
  page: string;
  progress: string;
  github: string;
}

export const endPoint: EndPointInterface = {
  index: "/",
  oauth: "/oauth",
  channel: "/api/channel",
  user: "/api/user",
  guest: "/api/guest",
  page: "/api/page",
  progress: "/api/progress",
  github: "/api/github",
};
