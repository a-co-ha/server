import { channelService } from "./../services";
import { AsyncRequestHandler } from "../types";
import { channelJoinInterface, IChannelInfo } from "../interface";
import { validationResult } from "express-validator";
import { listService } from "../services/listService";
import { pageService } from "../services/pageService";
interface IChannelController {
  create: AsyncRequestHandler;
  join: AsyncRequestHandler;
  delete: AsyncRequestHandler;
  channelExit: AsyncRequestHandler;
  getUsers: AsyncRequestHandler;
}
export class ChannelController implements IChannelController {
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
    const result = await channelService.invite(channelInfo);
    const channelId = result.id;

    await listService.createList(channelId);
    await pageService.createPage(channelId, blockId);
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
    const result = await channelService.join(joinInfo);
    res.json(result);
  };

  delete: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const userId = req.user.userId;

    const deleteChannel = await channelService.delete(channelId, userId);

    res.json(deleteChannel);
  };

  channelExit: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const userId = req.user.userId;

    const channelExit = await channelService.channelExit(userId, channelId);
    res.json(channelExit);
  };

  getUsers: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const result = await channelService.getUsers(channelId);

    res.json(result);
  };
}

const channelController = new ChannelController();
export { channelController };
