import { Response, NextFunction } from "express";
import { User } from "../model/user";

export default () => async (req: any, res: Response, next: NextFunction) => {
  if (req.session && req.session.user) {
    const user = await User.findOne({
      where: { userId: req.session.user.userId },
    });
    if (user) {
      req.users = user;
      req.session.user = user;
    }
    next();
  } else {
    next();
  }
};
