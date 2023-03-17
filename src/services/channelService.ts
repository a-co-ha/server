import { UserAttributes } from "./../interface/index";
import { IChannelModel } from "../interface/index";

import { IChannelInfo } from "../interface";
import { decode, ENCTYPE } from "../utils/decode";
import { Channel } from "../model/channel";
import { ChannelUser } from "../model/channelUser";
import { User } from "../model/user";
import { ifError } from "assert";
import { channelJoinInterface } from "../controllers";

export class ChannelService implements IChannelModel {
  async invite(info: channelJoinInterface): Promise<any> {
    const { admin, channelName, userId, name } = info;
    await Channel.create({ admin, channelName });

    const channel = await this.get(info);
    await ChannelUser.create({
      userId,
      userName: name,
      channelId: channel.id,
      channelName,
    });
    return channel;
  }

  // 채널 주인과, 채널 이름으로 찾음
  async get(info: IChannelInfo): Promise<any> {
    const { admin, channelName } = info;
    return await Channel.findOne({
      where: { admin, channelName },
      raw: true,
    });
  }

  async join(joinInfo: channelJoinInterface): Promise<any> {
    const {
      admin: adminCode,
      channelName: channelCode,
      name,
      userId,
    } = joinInfo;
    const admin = decode(adminCode, ENCTYPE.BASE64, ENCTYPE.UTF8);
    const channelName = decode(channelCode, ENCTYPE.BASE64, ENCTYPE.UTF8);

    const channelInfo = await this.get({ admin, channelName });

    if (channelName === channelInfo.channelName) {
      await ChannelUser.create({
        userId,
        userName: name,
        channelId: channelInfo.id,
        channelName,
      });
    } else {
      throw new Error("channel Not matching");
    }

    return { userId, channelName };
  }
}

export const channelService = new ChannelService();
