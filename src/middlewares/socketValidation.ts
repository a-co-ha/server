import { channelService } from "../services/channelService";
import { userService } from "../services";
import { RedisHandler } from "../utils";
import { userHasChannels } from "../interface";
import { Socket } from "socket.io";

export const isUser = (
  user: userHasChannels | boolean
): user is userHasChannels => {
  return (user as userHasChannels).name !== undefined;
};

export const socketValidation = async (
  sessionID: string,
  socket: any
): Promise<any> => {
  const sessionInfo = await RedisHandler.findSession(sessionID);

  socket.roomIds = await getChannels(sessionInfo.userId);
  socket.sessionID = sessionID;
  socket.userID = sessionInfo.userId;
  socket.name = sessionInfo.name;
  socket.img = sessionInfo.img;
};

const getChannels = async (userId: number): Promise<any> => {
  const getChannel = await userService.getUserWithChannels(userId);

  if (isUser(getChannel)) {
    const channels = await Promise.all(
      getChannel.channels.map(async (channel) => {
        const { id } = channel;

        return await channelService.getRooms(id);
      })
    );
    return channels.flat();
  }
  throw Error("채널 접속 실패");
};
