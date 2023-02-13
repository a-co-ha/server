import { IInviteModel } from "./../interface/index";
import { inviteModel } from "./../model";
import { ChannelType, ChannelMember } from "../interface";

export class InviteService {
  private inviteModel;
  constructor(inviteModel: IInviteModel) {
    this.inviteModel = inviteModel;
  }

  async invite(info: ChannelType): Promise<any> {
    if (!(await inviteModel.make(info))) {
      throw new Error(`failed to invite ${info}`);
    }
    return info;
  }

  async join(userId: string, code: string): Promise<any> {
    const channelName = Buffer.from(code, "base64").toString("utf-8");
    if (!(await inviteModel.join(userId, channelName))) {
      throw new Error(`failed to join`);
    }
    return { userId, channelName };
  }
}

const inviteService = new InviteService(inviteModel);

export { inviteService };
