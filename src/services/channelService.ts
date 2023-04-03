import { listModel } from "./../model/index";
import { channelJoinInterface } from "./../interface/index";
import { IChannelInfo } from "../interface";
import { decode, ENCTYPE } from "../utils/decode";
import { Channel, channelModel } from "../model/channel";
import { ChannelUser, channelUserModel } from "../model/channelUser";
import { User, userModel } from "../model/user";
import { listModelType } from "../model";
import { PageService, pageService } from "./pageService";

export class ChannelService {
  constructor(
    private channelUserModel: ChannelUser,
    private channelModel: Channel,
    private userModel: User,
    private listModel: listModelType,
    private pageService: PageService
  ) {}
  async create(info: channelJoinInterface, blockId: string): Promise<any> {
    const { admin, channelName, userId, name } = info;
    const channelNameCheck = await this.get(info);
    if (channelNameCheck) {
      throw new Error("같은 이름의 채널이 이미 있습니다.");
    }

    const newChannel = await Channel.create({
      userId: admin as number,
      channelName,
    });

    await this.createSpace(newChannel.id, blockId);
    await this.userJoin({
      userId,
      name,
      channelName,
      id: newChannel.id,
    });
    return newChannel;
  }

  private async createSpace(channelId: number, blockId: string): Promise<void> {
    await this.listModel.create({ channelId });
    await this.pageService.createPage(channelId, blockId);
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

  async getUsersWithAdminInfo(channelId: number): Promise<any> {
    const { userId } = await Channel.findOne({
      where: { id: channelId },
      raw: true,
      attributes: ["userId"],
    });

    const { count, rows: users } = await ChannelUser.findAndCountAll({
      where: { channelId },
      include: {
        model: User,
        required: true,
        attributes: ["user_id"],
      },
      raw: true,
    });

    const usersWithAdminInfo = users.map((user) => {
      const isAdmin = user["user.user_id"] === userId;
      return { ...user, admin: isAdmin };
    });

    return { count, users: usersWithAdminInfo };
  }
}

export const channelService = new ChannelService(
  channelUserModel,
  channelModel,
  userModel,
  listModel,
  pageService
);
