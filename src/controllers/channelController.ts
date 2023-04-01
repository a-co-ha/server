import { ChannelService } from "../services/channelService";
import { ListService } from "../services/listService";
import { PageService } from "../services/pageService";
import { channelJoinInterface } from "../interface";
import { AsyncRequestHandler } from "../constants";

export class ChannelController {
  constructor(
    private channelService: ChannelService,
    private listService: ListService,
    private pageService: PageService
  ) {}

  create: AsyncRequestHandler = async (req, res) => {
    const { userId, name } = req.user;
    const { channelName } = req.body;
    const channelInfo: channelJoinInterface = {
      admin: userId,
      channelName,
      userId,
      name,
    };

    const blockId = req.body.blockId;
    const result = await this.channelService.invite(channelInfo);
    const channelId = result.id;

    await this.listService.createList(channelId);
    await this.pageService.createPage(channelId, blockId);
    res.status(200).json(result);
  };

  join: AsyncRequestHandler = async (req, res) => {
    const { adminCode } = req.params;
    const channelCode = req.query.channelCode as string;

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
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const userId = req.user.userId;

    const deleteChannel = await this.channelService.delete(channelId, userId);
    await this.listService.deleteList(channelId);
    res.json(deleteChannel);
  };

  channelExit: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const userId = req.user.userId;

    const channelExit = await this.channelService.channelExit(
      userId,
      channelId
    );
    res.json(channelExit);
  };

  getUsers: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const result = await this.channelService.getUsers(channelId);

    res.json(result);
  };
}
