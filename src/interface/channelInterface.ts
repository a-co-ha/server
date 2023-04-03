import { UserAttributes } from "./userInterface";

export interface ChannelAttributes extends UserAttributes {
  id?: number;
  channelName: string;
  channelImg?: string;
}
export interface Channel_UserAttributes extends ChannelAttributes {
  id?: number;
  channelId: number;
}

export interface IChannelInfo {
  id?: number;
  admin?: string | number;
  channelName: string;
}
export interface IChannelModel {
  invite(info: IChannelInfo): Promise<void>;
  join(channelJoinInfo: channelJoinInterface): Promise<any>;
}
export interface userHasChannels extends UserAttributes {
  channels: ChannelAttributes[];
}
export interface channelJoinInterface extends IChannelInfo {
  userId: number;
  name: string;
}
