import { AsyncRequestHandler } from "../utils";
import { UserAttributes } from "./userInterface";

export interface IChannelController {
  create: AsyncRequestHandler;
  join: AsyncRequestHandler;
  channelImagUpdate: AsyncRequestHandler;
  channelNameUpdate: AsyncRequestHandler;
  delete: AsyncRequestHandler;
  channelExit: AsyncRequestHandler;
  getUsers: AsyncRequestHandler;
}
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
  delete(channelId: number, userId: number): Promise<object>;
  channelExit(userId: number, channelId: number): Promise<any>;
  getUsers(channelId: number): Promise<any>;
}
export interface userHasChannels extends UserAttributes {
  channels: ChannelAttributes[];
}
export interface channelJoinInterface extends IChannelInfo {
  userId: number;
  name: string;
}
