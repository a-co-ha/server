import { githubLogin } from "./../middlewares/login";
import { UserAttributes } from "./../interface/index";
import { userService } from "./../services/userService";
import { AsyncRequestHandler } from "../types";
import { Octokit, App } from "octokit";
interface IUserController {
  login: AsyncRequestHandler;
  get: AsyncRequestHandler;
}
export class UserController implements IUserController {
  login: AsyncRequestHandler = async (req, res) => {
    const isAuthenticated = !!req.user;
    if (isAuthenticated) {
      console.log(`user is authenticated, session is ${req.session.id}`);
    } else {
      console.log("unknown user");
    }

    if (req.user.name === undefined) {
      req.user.name = req.user.githubID;
    }
    const token = await userService.login(req.user);

    res.status(200).json({
      token,
      user: req.user,
    });
  };
  get: AsyncRequestHandler = async (req, res) => {
    const { userId, name, githubID, githubURL, img } = req.body;

    res.json(
      await userService.get({
        id: userId,
        name,
        githubID,
        githubURL,
        img,
      })
    );
  };
}

const userController = new UserController();
export { userController };
