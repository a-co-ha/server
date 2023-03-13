import crypto from "crypto";
import { userService } from "../services";
import redisCache from "../utils/redisCache";
export const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

const randomId = () => crypto.randomBytes(8).toString("hex");
export const socketMiddleware = async (socket, next) => {
  const session = socket.request.session;
  const sessionID = session.id;

  const { user } = session.passport;

  const userChannel = await userService.getChannels(user);

  socket.username = user.name;
  socket.img = user.img;
  socket.channel = userChannel;
  socket.sessionID = sessionID;

  const userInfo = await redisCache.findSession(sessionID);
  console.log(userInfo.userID);
  if (userInfo?.userID === undefined) {
    socket.userID = randomId();
  } else {
    socket.userID = userInfo.userID;
  }

  next();
};
