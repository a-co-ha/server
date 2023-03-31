import { UserAttributes } from "./userInterface";

export interface ChannelAttributes extends UserAttributes {
  id?: number;
  // admin: string;
  channelName: string;
  channelImg?: string;
}
export interface Channel_UserAttributes extends ChannelAttributes {
  id?: number;
  channelId: number;
}

export interface IChannelInfo {
  id?: number;
  admin?: string | number; // userId
  channelName: string;
}
export interface IChannel extends IChannelInfo {
  members: UserAttributes[];
}
export interface IChannelModel {
  invite(info: IChannelInfo): Promise<void>;
  join(channelJoinInfo: channelJoinInterface): Promise<any>;
}
export interface userHasChannels extends UserAttributes {
  channels: ChannelAttributes[];
}
export interface channelJoinInterface extends IChannelInfo {
  //userId, channelName
  userId: number;
  name: string;
}
