import { ChannelType, IInviteModel } from "../interface";
import { init, execute } from "../db/mysql";

export class InviteModel implements IInviteModel {
  async make(channel: ChannelType): Promise<void> {
    init();
    const { admin, channelName } = channel;
    await execute<ChannelType>(
      `insert into channel (admin, c_name) values (?, ?)`,
      [admin, channelName]
    );
  }

  async join(user: string, channelName: string): Promise<any> {
    init();
    await execute<ChannelType>(
      `insert into channel_user (user_id, channel_name) values (?, ?)`,
      [user, channelName]
    );
  }
}
export const inviteModel = new InviteModel();
