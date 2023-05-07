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
): Promise<void> => {
  const sessionInfo = await RedisHandler.findSession(sessionID);

  const channels = await getChannels(sessionInfo.userId);
  Object.assign(socket, {
    roomIds: channels,
    sessionID,
    userID: sessionInfo.userId,
    name: sessionInfo.name,
    img: sessionInfo.img,
  });
};

const getChannels = async (userId: number): Promise<any> => {
  const getChannel = await userService.getUserWithChannels(userId);

  if (isUser(getChannel)) {
    const channelIds = getChannel.channels.map((channel) => channel.id);
    const channels = await channelService.getRoomsForChannels(channelIds);
    return channels.flat();
  }
  throw new Error("채널 접속 실패");
};
