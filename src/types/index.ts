/* eslint-disable @typescript-eslint/no-namespace */
import { UserAttributes } from "../interface/userInterface";
import "express-session";
import "express";
import { Socket } from "socket.io";

declare global {
  namespace Express {
    interface Request {
      user?: UserAttributes;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: number;
    auth?: boolean;
    user?: UserAttributes;
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
