import crypto from "crypto";
import { SocketClosedUnexpectedlyError } from "redis";
import { userService } from "../services";
import redisCache from "../utils/redisCache";
export const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

const randomId = () => crypto.randomBytes(8).toString("hex");

export const socketMiddleware = async (socket, next) => {
  const session = socket.request.session;
  // const sessionID = socket.request.handshake.auth.sessionid;
  const sessionID = socket.handshake.headers.sessionid;

  const userInfo = await redisCache.findLogin(sessionID);
  const user = userInfo.user.user;

  const userChannel = await userService.getChannels(user);

  socket.username = user.name;
  socket.img = user.img;
  socket.channel = userChannel;
  socket.sessionID = sessionID;

  const sessionInfo = await redisCache.findSession(sessionID);

  if (sessionInfo) {
    socket.userID = sessionInfo.userID;
  } else {
    socket.userID = randomId();
  }

  next();
};
