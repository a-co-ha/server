interface EndPointInterface {
  index: string;
  oauth: string;
  channel: string;
  user: string;
  guest: string;
  page: string;
  template: string;
  list: string;
}

export const endPoint: EndPointInterface = {
  index: "/",
  oauth: "/oauth",
  channel: "/api/channel",
  user: "/api/user",
  guest: "/api/guest",
  page: "/api/page",
  template: "/api/template",
  list: "/api/list",
};
