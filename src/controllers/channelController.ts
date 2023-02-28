import { channelService } from "./../services";
import { AsyncRequestHandler } from "../types";
import { ChannelType } from "../interface";

interface IChannelController {
  create: AsyncRequestHandler;
  join: AsyncRequestHandler;
}
export class ChannelController implements IChannelController {
  create: AsyncRequestHandler = async (req, res) => {
    const channelInfo: ChannelType = {
      admin: req.body.name,
      channelName: req.body.channelName,
    };
    const result = await channelService.invite(channelInfo);
    res.json(result);
  };
  join: AsyncRequestHandler = async (req, res) => {
    const { admin } = req.params;
    const { channelName } = req.query;
    const { githubID } = req.body;

    const result = await channelService.join(githubID, admin, channelName);
    res.json(result);
  };
}

const channelController = new ChannelController();
export { channelController };
