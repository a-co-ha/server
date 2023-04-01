/* eslint-disable @typescript-eslint/no-namespace */
import { UserAttributes } from "../interface/userInterface";
import "express-session";
import "express";

declare global {
  namespace Express {
    interface Request {
      user?: UserAttributes;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userId: number;
    auth: boolean;
  }
}

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        location: string;
      }
    }
  }
}
