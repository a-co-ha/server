import { channelService } from "./../services/channelService";
import { userService } from "../services";
import redisCache from "../utils/redisCache";
import { userHasChannels } from "../interface";
export const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, socket.request.res || {}, next);

export const socketValidation = async (sessionID: string, socket) => {
  const sessionInfo = await redisCache.findSession(sessionID);
  if (!sessionInfo) {
    socket.emit("error", "세션을 찾을 수 없습니다. ");
    socket.disconnect();
    return;
  }

  socket.roomIds = await getChannels(sessionInfo.userId);

  socket.sessionID = sessionID;
  socket.userID = sessionInfo.userId;
  socket.name = sessionInfo.name;
  socket.img = sessionInfo.img;
};

const getChannels = async (userId: number) => {
  const getChannel = await userService.getUserWithChannels(userId);
  function isUser(user: userHasChannels | boolean): user is userHasChannels {
    return (user as userHasChannels).name !== undefined;
  }
  if (isUser(getChannel)) {
    const channels = getChannel.channels.map(async (i) => {
      const { id } = i;
      return await channelService.getRooms(id);
    });
    return await Promise.all(channels).then((results) => {
      return results.flatMap((room) => {
        return room.map((obj) => {
          return obj._id.toString().slice(2);
        });
      });
    });
  }
};
