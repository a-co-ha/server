import { ChannelAttributes, userHasChannels } from "./../interface/index";
import { DataTypes } from "sequelize";
import { Channel } from "./../model/channel";
import { setUserToken } from "./../utils/jwt";
import { UserAttributes } from "../interface";
import { User } from "../model/user";
import { ChannelUser } from "../model/channelUser";
import { redisCli } from "../utils/redisClient";

export class UserService {
  async login(user: UserAttributes) {
    const tokens = setUserToken(user);
    redisCli.set(user.userId, tokens.refreshToken );
    return tokens;
  }

  async get(id: number): Promise<userHasChannels | boolean> {
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
      where: { userId: id },
      attributes: ["user_id", "githubID", "githubURL", "img", "name"],
    });

    if (query.length <= 0) {
      return false;
    }
    const [{ userId, githubID, githubURL, img, name, ...rest }] = query.map(
      (el) => el.dataValues
    );
    const channels: ChannelAttributes[] = rest["userHasChannels"].map(
      (i) => i.dataValues.channel.dataValues
    );

    return {
      userId,
      name,
      githubID,
      githubURL,
      img,
      channels,
    };
  }

  async insert(user: UserAttributes) {
    if (user.name === null || user.name === undefined) {
      user.name = user.githubID;
    }
    await User.create(user);
  }
}

const userService = new UserService();

export { userService };
