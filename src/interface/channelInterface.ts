import { UserAttributes } from "./userInterface";

export interface ChannelAttributes {
  id: number;
  admin: string;
  channelName: string;
  channelImg: string;
}

export interface IChannelInfo {
  admin: string; // userId
  channelName: string;
}
export interface IChannel extends IChannelInfo {
  members: UserAttributes[];
}
export interface IChannelModel {
  invite(info: IChannelInfo): Promise<void>;
  join(channelJoinInfo: channelJoinInterface): Promise<any>;
}
export interface Channel_UserAttributes {
  userId: number;
  userName: string;
  channelId: number;
  channelName: string;
}
export interface userHasChannels extends UserAttributes {
  channels: ChannelAttributes[];
}
export interface channelJoinInterface extends IChannelInfo {
  //userId, channelName
  userId: number;
  name: string;
}
