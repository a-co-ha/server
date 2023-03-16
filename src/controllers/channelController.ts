import { channelService } from "./../services";
import { AsyncRequestHandler } from "../types";
import { IChannelInfo } from "../interface";
import { validationResult } from "express-validator";
interface IChannelController {
  create: AsyncRequestHandler;
  join: AsyncRequestHandler;
}
export class ChannelController implements IChannelController {
  create: AsyncRequestHandler = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const channelInfo: IChannelInfo = {
      admin: req.body.name,
      channelName: req.body.channelName,
    };
    await channelService.invite(channelInfo);
    const result = await channelService.get(channelInfo);
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
