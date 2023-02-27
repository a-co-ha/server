interface EndPointInterface {
  index: string;
  oauth: string;
  invite: string;
  user: string;
  guest: string;
  post: string;
  progress: string;
}

export const endPoint: EndPointInterface = {
  index: "/",
  oauth: "/oauth",
  invite: "/api/invite",
  user: "/api/user",
  guest: "/api/guest",
  post: "/api/post",
  progress: "/api/progress",
};
