import { channelJoinInterface, IChannelController } from "../interface";
import {
  channelService,
  ChannelService,
  UserService,
  userService,
} from "../services";
import { AsyncRequestHandler } from "../utils";
import { mysqlTransaction, MysqlTransaction } from "./../db";
import { Channel } from "./../model";

export class ChannelController implements IChannelController {
  constructor(
    private channelService: ChannelService,
    private userService: UserService,
    private mysqlTransaction: MysqlTransaction
  ) {}

  public createChannel: AsyncRequestHandler = async (req, res) => {
    const { userId, name } = req.user;
    const { channelName, blockId } = req.body;
    const channelInfo: channelJoinInterface = {
      admin: userId,
      channelName,
      userId,
      name,
    };
    let newChannel: Channel;
    await this.mysqlTransaction.execute(async (t) => {
      newChannel = await this.channelService.createChannel(
        t,
        channelInfo,
        blockId
      );
    });
    const { id: channelId } = newChannel;

    res.json({ id: channelId, channelName, admin: userId });
  };

  public joinChannel: AsyncRequestHandler = async (req, res) => {
    const { adminCode } = req.params;
    const { channelCode } = req.body;
    const { userId, name } = req.user;
    const joinInfo: channelJoinInterface = {
      admin: adminCode,
      channelName: channelCode,
      userId,
      name,
    };
    let result: Channel;
    await this.mysqlTransaction.execute(async (t) => {
      result = await this.channelService.joinChannel(t, joinInfo);
    });

    res.json(result);
  };

  public channelImagUpdate: AsyncRequestHandler = async (req, res) => {
    const channelImg = req.body.channelImg.location;

    const { channel: channelId } = req.body;
    const userId = req.user.userId;
    let channelImagupdate: Channel;
    await this.mysqlTransaction.execute(async (t) => {
      channelImagupdate = await this.channelService.channelImagUpdate(
        t,
        channelId,
        userId,
        channelImg
      );
    });
    res.json(channelImagupdate);
  };

  public channelNameUpdate: AsyncRequestHandler = async (req, res) => {
    const { channel: channelId, channelName } = req.body;

    const userId = req.user.userId;
    let channelNameUpdate: Channel;
    await this.mysqlTransaction.execute(async (t) => {
      channelNameUpdate = await this.channelService.channelNameUpdate(
        t,
        channelId,
        userId,
        channelName
      );
    });
    res.json(channelNameUpdate);
  };

  public deleteChannel: AsyncRequestHandler = async (req, res) => {
    const channelId = req.body.channel;
    const { userId } = req.user;

    await this.mysqlTransaction.execute(async (t) => {
      await this.channelService.deleteChannel(t, channelId, userId);
    });

    const result = await this.userService.getUserWithChannels(userId);

    res.json(result);
  };

  public exitChannel: AsyncRequestHandler = async (req, res) => {
    const { channel: channelId } = req.body;
    const { userId } = req.user;

    await this.mysqlTransaction.execute(async (t) => {
      await this.channelService.deleteChannelUser(t, channelId, userId);
    });

    const channelExit = await this.userService.getUserWithChannels(userId);
    res.json(channelExit);
  };

  public getUsers: AsyncRequestHandler = async (req, res) => {
    const { channel: channelId } = req.body;
    const result = await this.channelService.getUsersWithAdminInfo(channelId);

    res.json(result);
  };
}
export const channelController = new ChannelController(
  channelService,
  userService,
  mysqlTransaction
);
