export interface UserAttributes {
  userId?: number;
  name?: string;
  githubID?: string;
  githubURL?: string;
  img?: string;
}
export interface IUserModel {
  save(user: UserAttributes): Promise<any>;
  get(user: UserAttributes): Promise<any>;
}