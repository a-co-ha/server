import { listModel, socketModel, socketModelType } from "./../model/index";
import { ChannelAttributes, channelJoinInterface } from "./../interface/index";
import { IChannelInfo } from "../interface";
import { decode, ENCTYPE } from "../constants";
import { Channel, channelModel } from "../model/channel";
import { ChannelUser, channelUserModel } from "../model/channelUser";
import { User, userModel } from "../model/user";
import { listModelType } from "../model";
import { PageService, pageService } from "./pageService";
import { ListService, listService } from "./listService";
import { logger } from "../utils";

export class ChannelService {
  constructor(
    private channelUserModel: ChannelUser,
    private channelModel: Channel,
    private userModel: User,
    private listModel: listModelType,
    private listService: ListService,
    private pageService: PageService,
    private socketModel: socketModelType
  ) {}
  public async create(
    t: any,
    info: channelJoinInterface,
    blockId: string
  ): Promise<any> {
    const { admin, channelName, userId, name } = info;

    const channelNameCheck = await this.get(t, info);
    if (channelNameCheck) {
      throw Error("같은 이름의 채널이 이미 있습니다.");
    }
    const newChannel = await Channel.create(
      {
        userId: admin as number,
        channelName,
      },
      { transaction: t }
    );

    await this.createSpace(newChannel.id, blockId);

    await this.userJoin(t, {
      userId,
      name,
      channelName,
      id: newChannel.id,
    });

    return newChannel;
  }

  public async getRooms(channelId: number): Promise<any> {
    return await this.socketModel.find({ channelId }, { _id: 1 });
  }

  private async createSpace(channelId: number, blockId: string): Promise<void> {
    await this.listModel.create({ channelId });
    await this.pageService.createRoom(channelId);
    await this.pageService.createPage(channelId, blockId);
  }

  private async userJoin(
    transaction: any,
    info: channelJoinInterface
  ): Promise<void> {
    const { userId, id, name, channelName } = info;
    await ChannelUser.create(
      {
        userId,
        channelId: id,
        name,
        channelName,
      },
      { transaction }
    );
  }

  // 채널 주인과, 채널 이름으로 찾음
  private async get(transaction: any, info: IChannelInfo): Promise<Channel> {
    const { admin, channelName } = info;
    return await Channel.findOne({
      where: { userId: admin, channelName },
      raw: true,
      transaction,
    });
  }

  public async getChannels(
    // transaction: any,
    userId: number
  ): Promise<ChannelUser[]> {
    return await ChannelUser.findAll({
      where: { userId },
      raw: true,
      // transaction,
    });
  }

  public async join(t: any, joinInfo: channelJoinInterface): Promise<any> {
    const {
      admin: adminCode,
      channelName: channelCode,
      name,
      userId,
    } = joinInfo;

    const admin = decode(adminCode as string, ENCTYPE.BASE64, ENCTYPE.UTF8);
    const channelName = decode(channelCode, ENCTYPE.BASE64, ENCTYPE.UTF8);

    const channelInfo = await this.get(t, { admin, channelName });
    if (await this.isInvited({ channelName, name })) {
      throw Error(`${channelInfo.id}`);
    }

    if (channelName === channelInfo.channelName) {
      await this.userJoin(t, {
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

  public async channelImagUpdate(
    t: any,
    channelId: number,
    userId: number,
    channelImg: string
  ): Promise<Channel> {
    const { userId: admin } = await Channel.findOne({
      where: { id: channelId },
      raw: true,
      attributes: ["userId"],
      transaction: t,
    });
    if (admin !== userId) {
      throw Error("권한 오류");
    }

    return await Channel.update(
      { channelImg },
      { where: { id: channelId }, transaction: t }
    ).then(() => {
      return Channel.findOne({
        where: { id: channelId },
        raw: true,
        transaction: t,
      });
    });
  }

  public async channelNameUpdate(
    t: any,
    channelId: number,
    userId: number,
    channelName: string
  ): Promise<Channel> {
    const { userId: admin } = await Channel.findOne({
      where: { id: channelId },
      raw: true,
      attributes: ["userId"],
      transaction: t,
    });
    if (admin !== userId) {
      throw Error("권한 오류");
    }
    const channelNameUpdate = await Channel.update(
      { channelName },
      { where: { id: channelId }, transaction: t }
    ).then(() => {
      ChannelUser.update(
        { channelName },
        { where: { channelId }, transaction: t }
      );
      return Channel.findOne({
        where: { id: channelId },
        raw: true,
        transaction: t,
      });
    });

    return channelNameUpdate;
  }

  public async delete(
    t: any,
    channelId: number,
    userId: number
  ): Promise<number> {
    const channel = await Channel.findOne({
      where: { id: channelId },
      raw: true,
      attributes: ["userId"],
      transaction: t,
    });

    const admin = channel.userId;
    if (admin !== userId) {
      throw Error("권한 오류");
    }
    if (!admin) {
      throw Error("채널이 존재하지 않습니다. ");
    }

    await this.deleteChannelUser(t, channelId);

    await Channel.destroy({ where: { id: channelId }, transaction: t });

    await this.listService.deleteList(channelId);

    return channelId;
  }

  public async deleteChannelUser(
    transaction: any,
    channelId: number,
    userId?: number
  ): Promise<any> {
    const result = await ChannelUser.destroy({
      where: userId ? { userId, channelId } : { channelId },
      transaction,
    });

    if (result < 0) {
      throw Error("채널에서 나가는 중 에러가 발생했습니다.");
    }

    return { channelId, status: "채널에서 나갔습니다." };
  }

  public async getUsersWithAdminInfo(channelId: number): Promise<any> {
    const { userId } = await Channel.findOne({
      where: { id: channelId },
      raw: true,
      attributes: ["userId"],
    });

    const users = await ChannelUser.findAll({
      where: { channelId },
      include: {
        model: User,
        required: true,
        attributes: ["user_id"],
      },
      raw: true,
    });
    logger.warn(`currentUsers ${JSON.stringify(users)}`);

    const usersWithAdminInfo = users.map((user) => {
      const isAdmin = user["user.user_id"] === userId;
      return { ...user, admin: isAdmin };
    });

    logger.warn(`usersInfo ${JSON.stringify(usersWithAdminInfo)}`);
    return usersWithAdminInfo;
  }

  public async channelOrgAdd(
    channelId: number,
    orgGithubName: string
  ): Promise<any> {
    return await Channel.update(
      { orgGithubName },
      { where: { id: channelId } }
    );
  }
}

export const channelService = new ChannelService(
  channelUserModel,
  channelModel,
  userModel,
  listModel,
  listService,
  pageService,
  socketModel
);
