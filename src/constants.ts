interface EndPointInterface {
  index: string;
  user: string;
  guest: string;
}

export const endPoint: EndPointInterface = {
  index: "/",
  user: "/api/user",
  guest: "/api/guest",
};
