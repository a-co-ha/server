interface EndPointInterface {
  index: string;
  oauth: string;
  user: string;
  guest: string;
}

export const endPoint: EndPointInterface = {
  index: "/",
  oauth: "/oauth",
  user: "/api/user",
  guest: "/api/guest",
};
