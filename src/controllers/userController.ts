import { ErrorType } from "./../constants";
import { errorResponse } from "./../utils/errorResponse";
import { UserService, userService } from "./../services/userService";
import { AsyncRequestHandler } from "../constants";
import { connectSocket } from "../utils/connectSocket";
import { read } from "fs";

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
    console.log("세션 제거 전", req.session);
    req.session.destroy((err) => {
      if (err) {
        console.error("세션 삭제 중 오류 발생: ", err);
        res.status(500).send("세션 삭제 중 오류 발생");
      } else {
        console.log("세션 제거 후", req.session);
        res.status(200).json({ message: "로그아웃" });
      }
    });
  };
}

export const userController = new UserController(userService);
