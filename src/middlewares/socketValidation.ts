import { channelService } from "../services/channelService";
import { userService } from "../services";
import { RedisHandler } from "../utils";
import { userHasChannels } from "../interface";

export const isUser = (
  user: userHasChannels | boolean
): user is userHasChannels => {
  return (user as userHasChannels).name !== undefined;
};

export const socketValidation = async (sessionID: string, socket) => {
  const sessionInfo = await RedisHandler.findSession(sessionID);
  socket.roomIds = await getChannels(sessionInfo.userId);
  socket.sessionID = sessionID;
  socket.userID = sessionInfo.userId;
  socket.name = sessionInfo.name;
  socket.img = sessionInfo.img;
};

const getChannels = async (userId: number) => {
  const getChannel = await userService.getUserWithChannels(userId);

  if (isUser(getChannel)) {
    const channels = getChannel.channels.map(async (channel) => {
      const { id } = channel;

      return await channelService.getRooms(id);
    });

    return await Promise.all(channels).then((results) => {
      return results.flatMap((room) => {
        return room.map((obj) => {
          return obj._id.toString();
        });
      });
    });
  }
};
