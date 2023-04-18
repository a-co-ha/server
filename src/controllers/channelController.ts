import { Channel } from "./../model/channel";
import { mysqlTransaction } from "./../db/mysqlTransaction";
import { AsyncRequestHandler } from "./../constants";
import { channelService, ChannelService } from "../services/channelService";
import { channelJoinInterface } from "../interface";
import { Socket } from "../socketServer";
import { MysqlTransaction } from "../db/mysqlTransaction";

interface IChannelController {
  create: AsyncRequestHandler;
  join: AsyncRequestHandler;
  channelImagUpdate: AsyncRequestHandler;
  channelNameUpdate: AsyncRequestHandler;
  delete: AsyncRequestHandler;
  channelExit: AsyncRequestHandler;
  getUsers: AsyncRequestHandler;
}
export class ChannelController implements IChannelController {
  constructor(
    private channelService: ChannelService,
    private mysqlTransaction: MysqlTransaction
  ) {}

  public create: AsyncRequestHandler = async (req, res) => {
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
      newChannel = await this.channelService.create(t, channelInfo, blockId);
    });
    if (!newChannel) {
      throw Error("채널 생성 실패");
    }
    const { id: channelId } = newChannel;

    res.json({ id: channelId, channelName, admin: userId });
  };

  public join: AsyncRequestHandler = async (req, res) => {
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
      result = await this.channelService.join(t, joinInfo);
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

  public delete: AsyncRequestHandler = async (req, res) => {
    const channelId = req.body.channel;
    const { userId } = req.user;

    await this.mysqlTransaction.execute(async (t) => {
      await this.channelService.delete(t, channelId, userId);
    });
    res.json({ channelId, status: "삭제되었습니다." });
  };

  public channelExit: AsyncRequestHandler = async (req, res) => {
    const { channel: channelId } = req.body;
    const { userId } = req.user;
    let channelExit: Channel;
    await this.mysqlTransaction.execute(async (t) => {
      channelExit = await this.channelService.deleteChannelUser(
        t,
        channelId,
        userId
      );
    });
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
  mysqlTransaction
);
