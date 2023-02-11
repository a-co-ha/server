import { IInviteModel } from "./../interface/index";
import { inviteModel } from "./../model";
import { ChannelType } from "../interface";

export class InviteService {
  private inviteModel;
  constructor(inviteModel: IInviteModel) {
    this.inviteModel = inviteModel;
  }

  async invite(info: ChannelType): Promise<any> {
    return await inviteModel.make(info);
  }

  async join(userId: string, code: string) {
    const channelName = Buffer.from(code, "base64").toString("utf-8");
    await inviteModel.join(userId, channelName);
  }
}

const inviteService = new InviteService(inviteModel);

export { inviteService };
