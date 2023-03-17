import { ChannelAttributes } from "./../interface/index";
import { DataTypes } from "sequelize";
import { Channel } from "./../model/channel";
import { setUserToken } from "./../utils/jwt";
import { UserAttributes } from "../interface";
import { User } from "../model/user";
import { ChannelUser } from "../model/channelUser";
import { escapeId } from "mysql2";
import e from "express";
interface userHasChannels extends UserAttributes {
  channels: ChannelAttributes[];
}
export class UserService {
  async login(user: any) {
    return setUserToken(user);
  }

  async get(userId: number) {
    const query = await User.findAll({
      include: {
        model: ChannelUser,
        as: "userHasChannels",
        include: [
          {
            model: Channel,
            required: true,
          },
        ],
        attributes: ["channel_id"],
      },
      where: { id: userId },
      attributes: ["id", "githubID", "githubURL", "img", "name"],
    });

    const [{ id, githubID, githubURL, img, name, ...rest }] = query.map(
      (el) => el.dataValues
    );

    const channels: ChannelAttributes[] = rest["userHasChannels"].map(
      (i) => i.dataValues.channel.dataValues
    );

    return {
      id: userId,
      name,
      githubID,
      githubURL,
      img,
      channels,
    };
  }

  async getChannels(userId: number) {
    const query = await User.findAll({
      include: {
        model: ChannelUser,
        as: "userHasChannels",
        required: true,
        attributes: ["channelId"],
      },

      where: { id: userId },
    });

    return query
      .map((el) => {
        return el.dataValues["userHasChannels"].map(
          (i) => i.dataValues["channelId"]
        );
      })
      .flat();
  }

  async insert(user: UserAttributes) {
    await User.create(user);
  }
}

const userService = new UserService();

export { userService };
