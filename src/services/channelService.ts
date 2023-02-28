import { IChannelModel } from "../interface/index";
import { channelModel } from "../model";
import { IChannelInfo } from "../interface";
import { decode, ENCTYPE } from "../utils/decode";

export class ChannelService {
  private channelModel;
  constructor(channelModel: IChannelModel) {
    this.channelModel = channelModel;
  }

  async invite(info: IChannelInfo): Promise<any> {
    if (!(await channelModel.make(info))) {
      throw new Error(`failed to invite ${info}`);
    }
    return info;
  }

  async join(
    userId: string,
    adminCode: string,
    channelNameCode: any
  ): Promise<any> {
    const admin = decode(adminCode, ENCTYPE.BASE64, ENCTYPE.UTF8);
    const channelName = decode(channelNameCode, ENCTYPE.BASE64, ENCTYPE.UTF8);

    const channelId = await channelModel.getChannelId(channelName, admin);

    if (!(await channelModel.join(userId, channelId))) {
      throw new Error(`failed to join`);
    }
    return { userId, channelName };
  }
}

const channelService = new ChannelService(channelModel);

export { channelService };
