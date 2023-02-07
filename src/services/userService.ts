import { userModel } from "./../model/userModel";
import { setUserToken } from "./../utils/jwt";
import { UserType, IUserModel } from "../interface";

export class UserService {
  private userModel;
  constructor(userModel: IUserModel) {
    this.userModel = userModel;
  }

  //계정 로그인
  async login(user: any) {
    const { accessToken, refreshToken } = setUserToken(user);
    return { user, accessToken, refreshToken };
  }
}

const userService = new UserService(userModel);

export { userService };
