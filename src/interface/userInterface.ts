import { AsyncRequestHandler } from "../utils";

export interface User {
  userId?: number;
  name?: string;
  githubID?: string;
  githubURL?: string;
  img?: string;
}
export interface UserAttributes extends User {
  refreshToken?: string;
}

export interface UserLoginInterface {
  user: User;
  token: {
    accessToken: string;
    refreshToken: string;
  };
  sessionID: string;
}
export interface IUserController {
  login: AsyncRequestHandler;
  get: AsyncRequestHandler;
  tokenRefresh: AsyncRequestHandler;
  logout: AsyncRequestHandler;
}

export interface IUserModel {
  save(user: UserAttributes): Promise<any>;
  get(user: UserAttributes): Promise<any>;
}
