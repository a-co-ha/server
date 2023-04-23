import { ErrorType } from "./../constants";
import { errorResponse } from "./../utils/errorResponse";
import { UserService, userService } from "./../services/userService";
import { AsyncRequestHandler } from "../utils";
import { connectSocket } from "../utils/connectSocket";
import redisCache from "../utils/redisCache";

interface IUserController {
  login: AsyncRequestHandler;
  get: AsyncRequestHandler;
  tokenRefresh: AsyncRequestHandler;
  logout: AsyncRequestHandler;
}
export class UserController implements IUserController {
  constructor(private userService: UserService) {}
  public login: AsyncRequestHandler = async (req, res) => {
    const result = await this.userService.login(req.user, req.sessionID);

    req.session.user = result.user;

    req.session.save(() => {});
    req.session.save((err) => {
      if (err) {
        errorResponse(res, ErrorType.SERVERERROR, err);
      }
    });

    const existSession = await redisCache.getUserSession(
      result.user.userId as number
    );

    if (existSession) {
      await redisCache.delete(existSession.sessionID);
    }
    await redisCache.saveUserSession(
      result.user.userId as number,
      req.sessionID
    );

    // await connectSocket(req.sessionID);
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

  public logout: AsyncRequestHandler = async (req, res) => {
    const session = await redisCache.findSession(req.body.sessionID);
    if (!session) {
      throw new Error("세션을 찾을 수 없습니다. ");
    }
    await redisCache.delete(req.body.sessionID);
    res
      .status(200)
      .json({ sessionID: req.body.sessionID, message: "로그아웃 성공" });
  };
}

export const userController = new UserController(userService);
