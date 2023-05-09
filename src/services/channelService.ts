import {
  IChannelInfo,
  channelJoinInterface,
  Room,
  createPageOrTemplateInfo,
} from "../interface";
import { decode, ENCTYPE } from "../constants";
import {
  ChannelUser,
  channelUserModel,
  listModel,
  socketModel,
  socketModelType,
  listModelType,
  User,
  userModel,
  Channel,
  channelModel,
} from "../model";
import {
  ListService,
  listService,
  PageService,
  pageService,
} from "../services";
import { Transaction } from "sequelize";

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
  public async createChannel(
    t: Transaction,
    info: channelJoinInterface,
    blockId: string
  ): Promise<any> {
    const { admin, channelName, userId, name } = info;

    const channelNameCheck = await this.getChannelInfo(info, t);

    if (channelNameCheck) {
      throw new Error("같은 이름의 채널이 이미 있습니다.");
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

  public async getRooms(channelId: number): Promise<Room[]> {
    const users = (await channelService.usersOfChannel(channelId)).map(
      (user) => user.userId
    );

    const results = await this.socketModel.find({ channelId }, { _id: 1 });
    const result = results.map((room) => {
      const id = room._id.toString();
      const readUser = users;

      return { id, readUser };
    });
    return result;
  }

  private async createSpace(channelId: number, blockId: string): Promise<void> {
    const createPageInfo: createPageOrTemplateInfo = {
      channelId,
      blockId,
    };

    await this.listModel.create({ channelId });
    await this.pageService.createRoom(channelId);
    await this.pageService.createPage(createPageInfo);
  }

  private async userJoin(
    transaction: Transaction,
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

  public async getChannelInfo(
    info: IChannelInfo,
    transaction?: any
  ): Promise<Channel> {
    const where: { [key: string]: any } = {};
    if (info?.admin) where.userId = info.admin;
    if (info?.channelName) where.channelName = info.channelName;
    if (info?.id) where.id = info.id;
    return await Channel.findOne({
      where,
      raw: true,
      transaction,
    });
  }

  public async getChannels(userId: number): Promise<ChannelUser[]> {
    return await ChannelUser.findAll({
      where: { userId },
      raw: true,
    });
  }

  public async joinChannel(
    t: Transaction,
    joinInfo: channelJoinInterface
  ): Promise<any> {
    const {
      admin: adminCode,
      channelName: channelCode,
      name,
      userId,
    } = joinInfo;

    const admin = decode(adminCode as string, ENCTYPE.BASE64, ENCTYPE.UTF8);
    const channelName = decode(channelCode, ENCTYPE.BASE64, ENCTYPE.UTF8);

    const channelInfo = await this.getChannelInfo({ admin, channelName }, t);
    if (await this.isInvited({ channelName, name })) {
      throw new Error(`${channelInfo.id}`);
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
    t: Transaction,
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
      throw new Error("권한 오류");
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
    t: Transaction,
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
      throw new Error("권한 오류");
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

  public async deleteChannel(
    t: Transaction,
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
      throw new Error("권한 오류");
    }
    if (!admin) {
      throw new Error("채널이 존재하지 않습니다. ");
    }

    await this.deleteChannelUser(t, channelId);

    await Channel.destroy({ where: { id: channelId }, transaction: t });

    await this.listService.deleteList(channelId);

    return channelId;
  }

  public async deleteChannelUser(
    transaction: Transaction,
    channelId: number,
    userId?: number
  ): Promise<any> {
    const result = await ChannelUser.destroy({
      where: userId ? { userId, channelId } : { channelId },
      transaction,
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

    const users = await this.usersOfChannel(channelId);

    return await this.isAdmin(users, userId);
  }

  public usersOfChannel = async (channelId: number) => {
    const users = await ChannelUser.findAll({
      where: { channelId },
      include: {
        model: User,
        required: true,
        attributes: ["user_id"],
      },
      raw: true,
    });

    return users;
  };

  private isAdmin = async (users: ChannelUser[], admin: number) => {
    return users.map((user) => {
      const isAdmin = user["user.user_id"] === admin;
      return { ...user, admin: isAdmin };
    });
  };

  public async channelOrgAdd(
    channelId: number,
    orgGithubName: string
  ): Promise<any> {
    return await Channel.update(
      { orgGithubName },
      { where: { id: channelId } }
    );
  }
  public async getRoomsForChannels(channelIds: number[]): Promise<Room[][]> {
    return await Promise.all(
      channelIds.map((channel) => {
        return this.getRooms(channel);
      })
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
