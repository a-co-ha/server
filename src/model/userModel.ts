import { UserType, IUserModel } from "../interface";
import { execute } from "../db/mysql";
import { UserQueries } from "../db/queries/user";
export class UserModel implements IUserModel {
  async save(user: UserType): Promise<any> {
    const { name, githubID, githubURL, img } = user;
    await execute<UserType>(UserQueries.JoinUser, [
      name,
      githubID,
      githubURL,
      img,
    ]);
  }

  async get(user: UserType): Promise<any> {
    const { name, githubID, githubURL, img } = user;
    const userInfo = await execute<UserType[]>(UserQueries.GetUser, [
      name,
      githubID,
      githubURL,
      img,
    ]);
    return userInfo;
  }
}

export const userModel = new UserModel();
