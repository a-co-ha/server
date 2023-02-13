import { ResultSetHeader } from "mysql2";

import { ChannelType, IInviteModel } from "../interface";
import { init, execute } from "../db/mysql";

export class InviteModel implements IInviteModel {
  async make(channel: ChannelType): Promise<Boolean> {
    init();
    const { admin, channelName } = channel;
    const result = await execute<ResultSetHeader>(
      `insert into channel (admin, c_name) values (?, ?)`,
      [admin, channelName]
    );
    return result.affectedRows === 1;
  }

  async join(user: string, channelName: string): Promise<Boolean> {
    init();
    const result = await execute<ResultSetHeader>(
      `insert into channel_user (user_id, channel_name) values (?, ?)`,
      [user, channelName]
    );
    return result.affectedRows === 1;
  }
}
export const inviteModel = new InviteModel();
