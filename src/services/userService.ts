import { DataTypes } from "sequelize";
import { Channel } from "./../model/channel";
import { setUserToken } from "./../utils/jwt";
import { UserAttributes } from "../interface";
import { User } from "../model/user";
import { ChannelUser } from "../model/channelUser";
import { escapeId } from "mysql2";
import e from "express";
export class UserService {
  async login(user: any) {
    return setUserToken(user);
  }

  async get(user: UserAttributes) {
    const { name, githubID, githubURL, img } = user;

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
      where: { name, githubID, githubURL, img },
      attributes: ["github_id", "github_url", "img", "name"],
    });
    const userInfo = query.map((el) => el.dataValues);

    for (const channel of userInfo) {
      channel["userHasChannels"].map((i) => {
        return i.dataValues.channel.dataValues;
      });
    }
    return userInfo;
  }

  async getChannels(user: UserAttributes) {
    const { name, githubID, githubURL, img } = user;

    const query = await User.findAll({
      include: {
        model: ChannelUser,
        as: "userHasChannels",
        required: true,
        attributes: ["channelId"],
      },

      where: { name, githubID, githubURL, img },
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
