interface EndPointInterface {
  index: string;
  oauth: string;
  channel: string;
  user: string;
  guest: string;
  post: string;
  progress: string;
}

export const endPoint: EndPointInterface = {
  index: "/",
  oauth: "/oauth",
  channel: "/api/channel",
  user: "/api/user",
  guest: "/api/guest",
  post: "/api/post",
  progress: "/api/progress",
};
