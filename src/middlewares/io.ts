import crypto from "crypto";
import { userService } from "../services";
import redisCache from "../utils/redisCache";
import { userHasChannels } from "../interface";
export const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

const randomId = () => crypto.randomBytes(8).toString("hex");

export const socketMiddleware = async (socket, next) => {
  const sessionID = socket.handshake.auth.sessionId;
  const user = socket.handshake.auth.user;

  if (!sessionID || !user) {
    return next(new Error("소켓 에러"));
  }

  const getChannel = await userService.getUserWithChannels(user.userId);

  function isUser(user: userHasChannels | boolean): user is userHasChannels {
    return (user as userHasChannels).name !== undefined;
  }

  if (isUser(getChannel)) {
    const channels = getChannel.channels.map((i) => i.id);

    
    socket.channel = channels;
  }

  const sessionInfo = await redisCache.findSession(sessionID);

  socket.sessionID = sessionID;

  if (sessionInfo) {
    socket.userID = sessionInfo.userID;
    socket.name = sessionInfo.name;
    socket.img = sessionInfo.img;
    next();
  }
  socket.userID = randomId();
  socket.name = user.name;
  socket.img = user.img;

  next();
};
