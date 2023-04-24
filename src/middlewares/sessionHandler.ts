import { Response, NextFunction } from "express";
import { User } from "../model/user";
import session from "express-session";
import { sessionConfig } from "../config";
import { Request } from "express";

export interface ISessionStore {
  saveSession(req: Request): Promise<void>;
}

export const useSession = () => session(sessionConfig);

export class SessionStore implements ISessionStore {
  async saveSession(req: Request): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  static checkSession =
    () => async (req: any, res: Response, next: NextFunction) => {
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
}
