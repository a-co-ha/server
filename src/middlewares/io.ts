import { channelService } from "./../services/channelService";
import crypto from "crypto";
import { userService } from "../services";
import redisCache from "../utils/redisCache";
import { userHasChannels } from "../interface";
import { TokenType } from "../constants";
import { decode } from "./loginRequired";
export const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

const randomId = () => crypto.randomBytes(8).toString("hex");

export const socketValidation = async (socket, next) => {
  // const user = socket.handshake.auth.token;
  const user = socket.handshake.headers.token;
  try {
    const tokenType = user.split(" ")[0];
    const token = user.split(" ")[1];
    if (!(tokenType === TokenType.ACCESS || tokenType === TokenType.REFRESH)) {
      return next(new Error("토큰 타입 에러"));
    }

    const decoded = await decode(token);
    socket.user = decoded;

    next();
  } catch (err) {
    return next(new Error("유효하지 않은 토큰"));
  }
};

export const socketMiddleware = async (socket, next) => {
  const sessionID = socket.handshake.headers.sessionid;
  const { user } = socket;
  const getChannel = await userService.getUserWithChannels(user.userId);

  function isUser(user: userHasChannels | boolean): user is userHasChannels {
    return (user as userHasChannels).name !== undefined;
  }

  if (isUser(getChannel)) {
    const channels = getChannel.channels.map(async (i) => {
      const { id } = i;
      return channelService.getRooms(id);
    });

    const rooms = await Promise.all(channels).then((results) => {
      return results.flatMap((room) => {
        return room.map((obj) => {
          return obj._id.toString().slice(2);
        });
      });
    });

    socket.roomIds = rooms;
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
