/* eslint-disable @typescript-eslint/no-namespace */
import "express-session";
import "express";
import { Room, UserAttributes } from "../interface";

declare module "socket.io" {
  interface Socket {
    sessionID?: string;
    userID: number;
    name: string;
    img: string;
    roomIds: Room[];
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: UserAttributes;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    sessionID: string;
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
