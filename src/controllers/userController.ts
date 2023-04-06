import { UserService, userService } from "./../services/userService";
import { AsyncRequestHandler } from "../constants";

interface IUserController {
  login: AsyncRequestHandler;
  get: AsyncRequestHandler;
  tokenRefresh: AsyncRequestHandler;
}
export class UserController implements IUserController {
  constructor(private userService: UserService) {}
  public login: AsyncRequestHandler = async (req, res) => {
    const result = await this.userService.login(req.user);
    res.status(200).json(result);
  };

  public get: AsyncRequestHandler = async (req, res) => {
    const { userId } = req.user;
    res.status(200).json(await this.userService.getUserWithChannels(userId));
  };

  public tokenRefresh: AsyncRequestHandler = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const accessToken = await this.userService.expandAccToken(token, req.user);
    res.status(200).json(accessToken);
  };
}

export const userController = new UserController(userService);
