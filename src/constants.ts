interface EndPointInterface {
  index: string;
  oauth: string;
  user: string;
  guest: string;
  post: string;
}

export const endPoint: EndPointInterface = {
  index: "/",
  oauth: "/oauth",
  user: "/api/user",
  guest: "/api/guest",
  post: "/api/post",
};
