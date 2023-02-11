import { inviteService } from "./../services";
import { AsyncRequestHandler } from "../types";
import { ChannelType } from "../interface";

interface IInviteController {
  invite: AsyncRequestHandler;
}
export class InviteController implements IInviteController {
  invite: AsyncRequestHandler = async (req, res) => {
    const channelInfo: ChannelType = {
      admin: req.body.name,
      channelName: req.body.channelName,
    };
    return await inviteService.invite(channelInfo);
  };

  join: AsyncRequestHandler = async (req, res) => {
    const { code } = req.params;
    const { githubID } = req.body;

    await inviteService.join(githubID, code);
  };
}

const inviteController = new InviteController();
export { inviteController };
