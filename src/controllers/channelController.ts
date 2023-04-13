import { AsyncRequestHandler } from "./../constants";
import { channelService, ChannelService } from "../services/channelService";
import { listService, ListService } from "../services/listService";
import {
  ChannelAttributes,
  channelJoinInterface,
  IChannelInfo,
} from "../interface";
import { Socket } from "../socket/socketServer";

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
  constructor(private channelService: ChannelService) {}

  public create: AsyncRequestHandler = async (req, res) => {
    const { userId, name } = req.user;
    const { channelName, blockId } = req.body;
    const channelInfo: channelJoinInterface = {
      admin: userId,
      channelName,
      userId,
      name,
    };

    const newChannel = await this.channelService.create(channelInfo, blockId);
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

    const result = await this.channelService.join(joinInfo);

    res.json(result);
  };

  public channelImagUpdate: AsyncRequestHandler = async (req, res) => {
    const channelImg = req.body.image.location;
    console.log(req.body.image);

    const { channel: channelId } = req.body;
    const userId = req.user.userId;

    const channelImagupdate = await this.channelService.channelImagUpdate(
      channelId,
      userId,
      channelImg
    );
    res.json(channelImagupdate);
  };

  public channelNameUpdate: AsyncRequestHandler = async (req, res) => {
    const { channel: channelId, channelName } = req.body;

    const userId = req.user.userId;
    const channelNameUpdate = await this.channelService.channelNameUpdate(
      channelId,
      userId,
      channelName
    );
    res.json(channelNameUpdate);
  };

  public delete: AsyncRequestHandler = async (req, res) => {
    const channelId = req.body.channel;
    const { userId } = req.user;

    const deleteChannel = await this.channelService.delete(channelId, userId);

    res.json(deleteChannel);
  };

  public channelExit: AsyncRequestHandler = async (req, res) => {
    const { channel: channelId } = req.body;
    const { userId } = req.user;

    const channelExit = await this.channelService.deleteChannelUser(
      channelId,
      userId
    );
    res.json(channelExit);
  };

  public getUsers: AsyncRequestHandler = async (req, res) => {
    const { channel: channelId } = req.body;
    const result = await this.channelService.getUsersWithAdminInfo(channelId);

    res.json(result);
  };
}
export const channelController = new ChannelController(channelService);
