import { IInviteModel } from "../interface/index";
import { inviteModel } from "../model";
import { ChannelType, ChannelMember } from "../interface";

export class ChannelService {
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

  async join(
    userId: string,
    adminCode: string,
    channelNameCode: any
  ): Promise<any> {
    const admin = Buffer.from(adminCode, "base64").toString("utf-8");
    const channelName = Buffer.from(channelNameCode, "base64").toString(
      "utf-8"
    );

    const channelId = await inviteModel.getChannelId(channelName, admin);

    if (!(await inviteModel.join(userId, channelId))) {
      throw new Error(`failed to join`);
    }
    return { userId, channelName };
  }
}

const channelService = new ChannelService(inviteModel);

export { channelService };
