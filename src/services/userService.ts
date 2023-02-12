import { userModel } from "./../model/userModel";
import { setUserToken } from "./../utils/jwt";
import { UserType, IUserModel } from "../interface";

export class UserService {
  private userModel;
  constructor(userModel: IUserModel) {
    this.userModel = userModel;
  }

  async login(user: any) {
    const { accessToken, refreshToken } = setUserToken(user);
    return { user, accessToken, refreshToken };
  }

  async get(user: UserType) {
    return await userModel.get(user);
  }

  async insert(user: UserType) {
    await userModel.save(user);
  }
}

const userService = new UserService(userModel);

export { userService };
