import { channelService } from "./../services";
import { AsyncRequestHandler } from "../types";
import { channelJoinInterface, IChannelInfo } from "../interface";
import { validationResult } from "express-validator";
import { listService } from "../services/listService";
import { pageService } from "../services/pageService";
interface IChannelController {
  create: AsyncRequestHandler;
  join: AsyncRequestHandler;
}
export class ChannelController implements IChannelController {
  create: AsyncRequestHandler = async (req, res) => {
    const { channelName, userId, name } = req.body;
    const channelInfo: channelJoinInterface = {
      admin: userId,
      channelName,
      userId,
      name,
    };

    const blockId = req.body.blockId;
    const result = await channelService.invite(channelInfo);
    const channelId = result.dataValues.id;
    await listService.createList(channelId);
    await pageService.createPage(channelId, blockId);
    res.json(result);
  };
  join: AsyncRequestHandler = async (req, res) => {
    const { adminCode } = req.params;
    const channelCode = req.query.channelCode as string;
    const { userId, name } = req.body;
    const joinInfo: channelJoinInterface = {
      admin: adminCode,
      channelName: channelCode,
      userId,
      name,
    };
    const result = await channelService.join(joinInfo);
    res.json(result);
  };
}

const channelController = new ChannelController();
export { channelController };
