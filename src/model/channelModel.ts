import { ResultSetHeader } from "mysql2";
import { ChannelQueries } from "../db/queries/channel";
import { ChannelType, IChannelModel } from "../interface";
import { execute } from "../db/mysql";

export class ChannelModel implements IChannelModel {
  async make(channel: ChannelType): Promise<boolean> {
    const { admin, channelName } = channel;
    const result = await execute<ResultSetHeader>(ChannelQueries.AddChannel, [
      admin,
      channelName,
    ]);

    return result.affectedRows === 1;
  }

  async join(user: string, channelId: number): Promise<boolean> {
    const result = await execute<ResultSetHeader>(ChannelQueries.JoinChannel, [
      user,
      channelId,
    ]);

    return result.affectedRows === 1;
  }

  async getChannelId(channelName: string, admin: string): Promise<number> {
    const result = await execute<number[]>(ChannelQueries.GetChannelId, [
      channelName,
      admin,
    ]);

    if (result?.[0] === undefined) {
      throw new Error(
        "can not found channelName : " + channelName + " admin : " + admin
      );
    }
    return result?.[0];
  }
}
export const channelModel = new ChannelModel();
