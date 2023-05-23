import { MysqlTransaction } from "../db";
import { IUserController, UserLoginInterface } from "../interface";
import { SessionStore } from "../middlewares";
import { AsyncRequestHandler, RedisHandler } from "../utils";
import { mysqlTransaction } from "./../db/mysqlTransaction";
import { UserService, userService } from "./../services/userService";

export class UserController implements IUserController {
  private sessionStore: SessionStore;
  constructor(
    private userService: UserService,
    private mysqlTransaction: MysqlTransaction,
    sessionStore?: SessionStore
  ) {
    this.sessionStore = sessionStore ?? new SessionStore();
  }

  public login: AsyncRequestHandler = async (req, res) => {

    let result: UserLoginInterface;
    await this.mysqlTransaction.execute(async (t) => {
      result = await this.userService.login(t, req.user, req.sessionID);
    });

    req.session.user = result.user;
    await this.sessionStore.saveSession(req);

    const existSession = await RedisHandler.getUserSession(result.user.userId);

    if (existSession) {
      await RedisHandler.deleteSession(existSession.sessionID);
    }
    await RedisHandler.saveUserSession(result.user.userId, req.sessionID);

    res.status(200).json(result);
  };

  public get: AsyncRequestHandler = async (req, res) => {
    const { userId } = req.user;

    const result = await this.userService.getUserWithChannels(userId);

    res.status(200).json(result);
  };

  public tokenRefresh: AsyncRequestHandler = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const accessToken = await this.userService.expandAccToken(token, req.user);
    res.status(200).json(accessToken);
  };

  public logout: AsyncRequestHandler = async (req, res) => {
    await RedisHandler.findSession(req.body.sessionID);

    await RedisHandler.deleteSession(req.body.sessionID);

    res
      .status(200)
      .json({ sessionID: req.body.sessionID, message: "로그아웃 성공" });
  };
}

export const userController = new UserController(userService, mysqlTransaction);
