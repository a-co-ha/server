import { inviteService } from "./../services";
import { AsyncRequestHandler } from "../types";
import { ChannelType } from "../interface";

interface IInviteController {
  invite: AsyncRequestHandler;
  join: AsyncRequestHandler;
}
export class InviteController implements IInviteController {
  invite: AsyncRequestHandler = async (req, res) => {
    const channelInfo: ChannelType = {
      admin: req.body.name,
      channelName: req.body.channelName,
    };
    const result = await inviteService.invite(channelInfo);
    res.json(result);
  };

  join: AsyncRequestHandler = async (req, res) => {
    const { code } = req.params;
    const { githubID } = req.body;

    const result = await inviteService.join(githubID, code);
    res.json(result);
  };
}

const inviteController = new InviteController();
export { inviteController };
