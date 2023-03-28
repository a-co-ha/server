import { errorResponse } from "./../utils/errorResponse";
import { userService } from "./../services/userService";
import { AsyncRequestHandler, ErrorType } from "../types";

interface IUserController {
  login: AsyncRequestHandler;
  get: AsyncRequestHandler;
  tokenRefresh: AsyncRequestHandler;
}
export class UserController implements IUserController {
  login: AsyncRequestHandler = async (req, res) => {
    const isAuthenticated = !!req.user;
    if (!isAuthenticated) {
      errorResponse(res, ErrorType.BADREQUEST, " unknown user");
    }

    req.session.userId = req.user.userId;
    req.session.auth = true;

    if (req.user.name === undefined || req.user.name === null) {
      req.user.name = req.user.githubID;
    }
    const result = await userService.login(req.session.id, req.user);

    res.status(200).json(result);
  };

  get: AsyncRequestHandler = async (req, res) => {
    const { userId } = req.user;
    res.status(200).json(await userService.get(userId));
  };
  tokenRefresh: AsyncRequestHandler = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const accessToken = await userService.expandAccToken(token, req.body);
    res.status(200).json(accessToken);
  };
}

const userController = new UserController();
export { userController };
