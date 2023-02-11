interface EndPointInterface {
  index: string;
  oauth: string;
  invite: string;
}

export const endPoint: EndPointInterface = {
  index: "/",
  oauth: "/oauth",
  invite: "/api/invite",
};
