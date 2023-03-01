import { setUserToken } from "./../utils/jwt";
import { UserAttributes } from "../interface";
import { User } from "../model/user";
export class UserService {
  async login(user: any) {
    const { accessToken, refreshToken } = setUserToken(user);
    return { user, accessToken, refreshToken };
  }

  async get(user: UserAttributes) {
    const { name, githubID, githubURL, img } = user;
    return await User.findOne({
      where: { name, githubID, githubURL, img },
      raw: true,
    });
  }

  async insert(user: UserAttributes) {
    await User.create(user);
  }
}

const userService = new UserService();

export { userService };
