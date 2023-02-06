import { IUser } from '../routers/passport/github';
import { setUserToken } from './../utils/jwt';
export interface IUserModel {
    login(user : IUser):Promise<any>;
}
export class UserModel implements IUserModel {
    async login(user : IUser) {

    }
}

export const userModel = new UserModel();

export class UserService {

  constructor(private User: UserModel) {
    this.User = userModel;
  }

  //계정 로그인
  async login(user : any) {
      const {accessToken, refreshToken}= setUserToken(user);
      return {  user, accessToken, refreshToken  }
  }


}

const userService = new UserService(userModel);

export { userService };
