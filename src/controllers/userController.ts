import { UserAttributes } from "./../interface/index";
import { userService } from "./../services/userService";
import { AsyncRequestHandler } from "../types";

interface IUserController {
  login: AsyncRequestHandler;
  get: AsyncRequestHandler;
}
export class UserController implements IUserController {
  login: AsyncRequestHandler = async (req, res) => {
    const result = await userService.login(req.user);
    res.json(result);
  };
  get: AsyncRequestHandler = async (req, res) => {
    const { name, githubID, githubURL, img }: UserAttributes = req.body;
    res.json(await userService.get({ name, githubID, githubURL, img }));
  };
}

const userController = new UserController();
export { userController };
