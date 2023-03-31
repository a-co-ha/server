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
    const channelNameCheck = await this.get(info);
    if (channelNameCheck) {
      throw new Error("같은 이름의 채널이 이미 있습니다.");
    }

    await Channel.create({ userId: admin as number, channelName });

    const channel = await this.get(info);
    await this.userJoin({
      userId,
      name,
      channelName,
      id: channel.id,
    });
    return channel;
  }

  private async userJoin(info: channelJoinInterface): Promise<void> {
    const { userId, id, name, channelName } = info;
    await ChannelUser.create({
      userId,
      channelId: id,
      name,
      channelName,
    });
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
    if (await this.isInvited({ channelName, name })) {
      throw new Error("이미 참여함");
    }
    const channelInfo = await this.get({ admin, channelName });

    if (channelName === channelInfo.channelName) {
      await this.userJoin({
        userId,
        name,
        channelName,
        id: channelInfo.id,
      });
    } else {
      throw new Error("channel Not matching");
    }

    return { channelId: channelInfo.id, userId, channelName };
  }

  async isInvited({ channelName, name }): Promise<boolean> {
    const result = await ChannelUser.findAll({
      where: {
        channelName,
        name,
      },
    });

    return result.length !== 0;
  }
  async delete(channelId: number, userId: number): Promise<object> {
    const channel = await Channel.findOne({
      where: { id: channelId },
      raw: true,
    });
    if (channel.userId !== userId) {
      throw new Error("채널 주인이 아닙니다.");
    }

    await ChannelUser.destroy({ where: { channelId } });
    const deleteChannel = await Channel.destroy({
      where: { id: channelId },
    }).then(() => {
      const deleteInfo = {
        channelId,
        status: "삭제 되었습니다.",
      };

      return deleteInfo;
    });
    return deleteChannel;
  }

  async channelExit(userId: number, channelId: number): Promise<any> {
    const channelExit = await ChannelUser.destroy({
      where: { userId, channelId },
    }).then((result) => {
      if (result === 1) {
        const channelInfo = {
          channelId,
          status: "채널을 나갔습니다.",
        };
        return channelInfo;
      } else {
        throw new Error("속하지 않은 채널입니다.");
      }
    });

    return channelExit;
  }

  async getUsers(channelId: number): Promise<any> {
    const result = await ChannelUser.findAll({
      include: {
        model: User,
        required: true,
        attributes: ["user_id"],
      },
      raw: true,
      where: { channelId },
    });
    const { userId } = await Channel.findOne({
      where: { id: channelId },
      raw: true,
      attributes: ["userId"],
    });

    const a = result.map((i) => {
      i["admin"] = i.userId === userId;
      return i;
    });

    return a;
  }
}

export const channelService = new ChannelService();
