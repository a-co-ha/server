import { userService, channelService } from "../services";
import { RedisHandler } from "../utils";
import { Room, userHasChannels } from "../interface";

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

  const rooms = await getRooms(sessionInfo.userId);
  Object.assign(socket, {
    roomIds: rooms,
    sessionID,
    userID: sessionInfo.userId,
    name: sessionInfo.name,
    img: sessionInfo.img,
  });
};

const getRooms = async (userId: number): Promise<Room[]> => {
  const getChannel = await userService.getUserWithChannels(userId);

  if (isUser(getChannel)) {
    const channelIds = getChannel.channels.map((channel) => channel.id);
    const rooms = await channelService.getRoomsForChannels(channelIds);
    return rooms.flat();
  }
  throw new Error("채널 접속 실패");
};
