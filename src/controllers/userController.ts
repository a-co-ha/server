import { AsyncRequestHandler } from "../types";
import { setUserToken } from "../utils/jwt";

interface IUserController {
  login: AsyncRequestHandler;
}
export class UserController implements IUserController {
  login: AsyncRequestHandler = async (req, res) => {
    const user = req.user;
    const result = setUserTokendfds(req.user);
    res.json({ user, result });
  };
}

const userController = new UserController();
export { userController };
