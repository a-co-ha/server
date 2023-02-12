import { userService } from "./../services/userService";
import { AsyncRequestHandler } from "../types";

interface IUserController {
  login: AsyncRequestHandler;
}
export class UserController implements IUserController {
  login: AsyncRequestHandler = async (req, res) => {
    //     const user = req.user;
    //     const result = setUserToken(req.user);
    //     res.json({ user, result });
    const result = await userService.login(req.user);
    res.json(result);
  };
}

const userController = new UserController();
export { userController };
