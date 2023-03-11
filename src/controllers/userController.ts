import { UserAttributes } from "./../interface/index";
import { userService } from "./../services/userService";
import { AsyncRequestHandler } from "../types";

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
    const token = await userService.login(req.user);
    req.session.authenticated = true;
    req.session.token = token;
    res.sendFile(
      req.isAuthenticated()
        ? "/Users/seungha/dev/acoha_server/src/routers/index.html"
        : "login.html"
    );
  };
  get: AsyncRequestHandler = async (req, res) => {
    const { name, githubID, githubURL, img }: UserAttributes = req.body;
    res.json(await userService.get({ name, githubID, githubURL, img }));
  };
}

const userController = new UserController();
export { userController };
