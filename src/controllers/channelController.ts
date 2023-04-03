import { AsyncRequestHandler } from "./../constants";
import { channelService, ChannelService } from "../services/channelService";
import { listService, ListService } from "../services/listService";
import { pageService, PageService } from "../services/pageService";
import { channelJoinInterface } from "../interface";

export class ChannelController {
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

  join: AsyncRequestHandler = async (req, res) => {
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

  delete: AsyncRequestHandler = async (req, res) => {
    const channelId = req.body.channel;
    const { userId } = req.user;

    const deleteChannel = await this.channelService.delete(channelId, userId);
    await this.listService.deleteList(channelId);
    res.json(deleteChannel);
  };

  channelExit: AsyncRequestHandler = async (req, res) => {
    const channelId = req.body.channel;
    const { userId } = req.user;

    const channelExit = await this.channelService.channelExit(
      userId,
      channelId
    );
    res.json(channelExit);
  };

  getUsers: AsyncRequestHandler = async (req, res) => {
    const channelId = req.body.channel;
    const result = await this.channelService.getUsersWithAdminInfo(channelId);

    res.json(result);
  };
}
export const channelController = new ChannelController(
  channelService,
  listService
);
