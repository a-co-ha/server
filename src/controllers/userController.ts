import { errorResponse } from "./../utils/errorResponse";
import { userService } from "./../services/userService";
import { AsyncRequestHandler, ErrorType } from "../types";

interface IUserController {
  login: AsyncRequestHandler;
  get: AsyncRequestHandler;
}
export class UserController implements IUserController {
  login: AsyncRequestHandler = async (req, res) => {
    const isAuthenticated = !!req.user;
    if (!isAuthenticated) {
      errorResponse(res, ErrorType.BADREQUEST, " unknown user");
    }

    req.session.userId = req.user.id;
    req.session.auth = true;

    if (req.user.name === undefined || req.user.name === null) {
      req.user.name = req.user.githubID;
    }
    const token = await userService.login(req.user);

    res.status(200).json({
      token,
      user: req.user,
    });
  };

  get: AsyncRequestHandler = async (req, res) => {
    const { userId } = req.body;
    res.status(200).json(await userService.get(userId));
  };
}

const userController = new UserController();
export { userController };
