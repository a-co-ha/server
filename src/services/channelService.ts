import { cascade } from "./../middlewares/cascade";
import { channelJoinInterface, UserAttributes } from "./../interface/index";
import { IChannelModel } from "../interface/index";
import { IChannelInfo } from "../interface";
import { decode, ENCTYPE } from "../utils/decode";
import { Channel } from "../model/channel";
import { ChannelUser } from "../model/channelUser";
import { User } from "../model/user";

export class ChannelService implements IChannelModel {
  async invite(info: channelJoinInterface): Promise<any> {
    const { admin, channelName, userId, name } = info;

    await Channel.create({ userId: admin as number, channelName });

    const channel = await this.get(info);
    await ChannelUser.create({
      userId,
      name,
      channelId: channel.id,
      channelName,
    });
    return channel;
  }

  // 채널 주인과, 채널 이름으로 찾음
  async get(info: IChannelInfo): Promise<any> {
    const { admin, channelName } = info;
    return await Channel.findOne({
      where: { userId: admin, channelName },
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
    const admin = decode(adminCode as string, ENCTYPE.BASE64, ENCTYPE.UTF8);
    const channelName = decode(channelCode, ENCTYPE.BASE64, ENCTYPE.UTF8);

    const channelInfo = await this.get({ admin, channelName });

    if (channelName === channelInfo.channelName) {
      await ChannelUser.create({
        userId,
        name,
        channelId: channelInfo.id,
        channelName,
      });
    } else {
      throw new Error("channel Not matching");
    }

    return { userId, channelName };
  }
  async delete(channelId: number): Promise<any> {
    return await Channel.destroy({ where: { id: channelId } });
  }

  async getUsers(channelId: number): Promise<any> {
    const result = await ChannelUser.findAll({
      include: {
        model: User,
        required: true,
        attributes: ["user_id"],
      },
      where: { channelId },
    });
    return result;
  }
}

export const channelService = new ChannelService();
