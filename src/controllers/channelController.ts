import { AsyncRequestHandler } from "./../constants";
import { channelService, ChannelService } from "../services/channelService";
import { listService, ListService } from "../services/listService";
import { channelJoinInterface } from "../interface";

interface IChannelController {
  create: AsyncRequestHandler;
  join: AsyncRequestHandler;
  delete: AsyncRequestHandler;
  channelExit: AsyncRequestHandler;
  getUsers: AsyncRequestHandler;
}
export class ChannelController implements IChannelController {
  constructor(
    private channelService: ChannelService,
    private listService: ListService
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

  public delete: AsyncRequestHandler = async (req, res) => {
    const channelId = req.body.channel;
    const { userId } = req.user;

    const deleteChannel = await this.channelService.delete(channelId, userId);
    await this.listService.deleteList(channelId);
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
export const channelController = new ChannelController(
  channelService,
  listService
);
