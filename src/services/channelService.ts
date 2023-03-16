import { UserAttributes } from "./../interface/index";
import { IChannelModel } from "../interface/index";

import { IChannelInfo } from "../interface";
import { decode, ENCTYPE } from "../utils/decode";
import { Channel } from "../model/channel";
import { ChannelUser } from "../model/channelUser";
import { User } from "../model/user";

export class ChannelService implements IChannelModel {
  async invite(info: IChannelInfo): Promise<any> {
    const { admin, channelName } = info;
    await Channel.create({ admin, channelName });
    return await this.get(info);
  }

  async get(info: IChannelInfo): Promise<any> {
    const { admin, channelName } = info;
    return await Channel.findOne({
      where: { admin, channelName },
      raw: true,
    });
  }

  async join(
    userId: string,
    adminCode: string,
    channelNameCode: any
  ): Promise<any> {
    const admin = decode(adminCode, ENCTYPE.BASE64, ENCTYPE.UTF8);
    const channelName = decode(channelNameCode, ENCTYPE.BASE64, ENCTYPE.UTF8);

    const { id } = await this.get({ admin, channelName });

    await ChannelUser.create({ userId, channelId: id });

    return { userId, channelName };
  }
}

export const channelService = new ChannelService();
