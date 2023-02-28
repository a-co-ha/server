import { ResultSetHeader } from "mysql2";

import { ChannelType, IInviteModel } from "../interface";
import { init, execute } from "../db/mysql";

export class InviteModel implements IInviteModel {
  async make(channel: ChannelType): Promise<boolean> {
    init();
    const { admin, channelName } = channel;
    const result = await execute<ResultSetHeader>(
      `insert into channel (admin, c_name) values (?, ?)`,
      [admin, channelName]
    );

    return result.affectedRows === 1;
  }

  async join(user: string, channelId: number): Promise<boolean> {
    init();
    const result = await execute<ResultSetHeader>(
      `insert into channel_user (user_id, channel_id ) values (?, ?)`,
      [user, channelId]
    );

    return result.affectedRows === 1;
  }

  async getChannelId(channelName: string, admin: string): Promise<number> {
    init();
    const result = await execute<number[]>(
      `select id from channel where c_name = ? and admin = ?`,
      [channelName, admin]
    );

    if (result?.[0] === undefined) {
      throw new Error(
        "can not found channelName : " + channelName + " admin : " + admin
      );
    }
    return result?.[0];
  }
}
export const inviteModel = new InviteModel();
