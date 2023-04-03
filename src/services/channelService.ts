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
  public async create(
    info: channelJoinInterface,
    blockId: string
  ): Promise<any> {
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
  private async get(info: IChannelInfo): Promise<Channel> {
    const { admin, channelName } = info;
    return await Channel.findOne({
      where: { userId: admin, channelName },
      raw: true,
    });
  }

  public async join(joinInfo: channelJoinInterface): Promise<any> {
    const {
      admin: adminCode,
      channelName: channelCode,
      name,
      userId,
    } = joinInfo;
    const admin = decode(adminCode as string, ENCTYPE.BASE64, ENCTYPE.UTF8);
    const channelName = decode(channelCode, ENCTYPE.BASE64, ENCTYPE.UTF8);

    if (await this.isInvited({ channelName, name })) {
      throw new Error("이미 참여한 채널입니다. ");
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

  private async isInvited({ channelName, name }): Promise<boolean> {
    const { count } = await ChannelUser.findAndCountAll({
      where: {
        channelName,
        name,
      },
    });

    return count !== 0;
  }

  public async delete(channelId: number, userId: number): Promise<object> {
    const { userId: admin } = await Channel.findOne({
      where: { id: channelId },
      raw: true,
      attributes: ["userId"],
    });

    if (admin !== userId) {
      throw new Error("권한 오류");
    }

    await this.deleteChannelUser(channelId);

    try {
      await Channel.destroy({ where: { id: channelId } });

      const deleteInfo = {
        channelId,
        status: "삭제 되었습니다.",
      };

      return deleteInfo;
    } catch (err) {
      throw new Error("채널 삭제 실패");
    }
  }

  public async deleteChannelUser(
    channelId: number,
    userId?: number
  ): Promise<any> {
    const result = await ChannelUser.destroy({
      where: userId ? { userId, channelId } : { channelId },
    });

    if (result < 0) {
      throw new Error("채널에서 나가는 중 에러가 발생했습니다.");
    }

    return { channelId, status: "채널에서 나갔습니다." };
  }

  public async getUsersWithAdminInfo(channelId: number): Promise<any> {
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
