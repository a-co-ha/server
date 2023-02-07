import { UserType, IUserModel } from "../interface";
import { init, execute } from "../db/mysql";
export class UserModel implements IUserModel {
  async save(user: UserType): Promise<any> {
    const { name, githubID, githubURL, img } = user;
    await execute<UserType>(
      `insert into user (name, githubID, githubURL, img) values (?,?,?,?)`,
      [name, githubID, githubURL, img]
    );
  }

  async get(user: UserType): Promise<any> {
    const { name, githubID, githubURL, img } = user;

    const userInfo = await execute<UserType[]>(
      `select * from user where name = ? 
           and githubID = ? 
           and githubURL = ? 
           and img = ? `,
      [name, githubID, githubURL, img]
    );

    return userInfo;
  }
}

export const userModel = new UserModel();
