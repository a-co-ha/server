import { UserAttributes } from "./../interface/userInterface";
import crypto from "crypto";
import { SocketClosedUnexpectedlyError } from "redis";
import { userService } from "../services";
import redisCache from "../utils/redisCache";
import { userHasChannels } from "../interface";
export const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

const randomId = () => crypto.randomBytes(8).toString("hex");

export const socketMiddleware = async (socket, next) => {
  // const sessionID = socket.request.handshake.auth.sessionid;
  const sessionID = socket.handshake.headers.sessionid;

  const { userId, auth } = await redisCache.findLogin(sessionID);

  if (!auth || userId === null || userId === undefined) {
    throw new Error("no authentication");
  }

  const user = await userService.get(userId);

  function isUser(user: userHasChannels | boolean): user is userHasChannels {
    return (user as userHasChannels).name !== undefined;
  }

  if (isUser(user)) {
    const channels = user.channels.map((i) => i.id);
    socket.username = user.name;
    socket.img = user.img;
    socket.channel = channels;
    socket.sessionID = sessionID;
  }

  const sessionInfo = await redisCache.findSession(sessionID);

  if (sessionInfo) {
    socket.userID = sessionInfo.userID;
  } else {
    socket.userID = randomId();
  }

  next();
};
