import { ChannelAttributes, userHasChannels } from "./../interface/index";
import { Channel } from "./../model/channel";
import { UserAttributes } from "../interface";
import { User } from "../model/user";
import { ChannelUser } from "../model/channelUser";
import jwt, { Secret } from "jsonwebtoken";
import { jwtSecret } from "../config";

import { connectSocket } from "../utils/connectSocket";

export class UserService {
  private tokenCreate = (
    isAccess: boolean,
    payload: UserAttributes
  ): string => {
    return jwt.sign(payload, jwtSecret, {
      expiresIn: isAccess ? "1h" : "3h",
    });
  };

  async login(sessionId: string, user: UserAttributes) {
    const accessToken = this.tokenCreate(true, user);
    const refreshToken = this.tokenCreate(false, user);
    await connectSocket(sessionId, user);
    await User.update(
      {
        refreshToken: refreshToken,
      },
      {
        where: {
          userId: user.userId,
        },
      }
    );
    return { token: { accessToken, refreshToken }, user };
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
      attributes: ["userId", "githubID", "githubURL", "img", "name"],
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

  async expandAccToken(token: string, user: UserAttributes) {
    const { refreshToken } = await User.findOne({
      where: { userId: user.userId },
      attributes: ["refreshToken"],
      raw: true,
    });

    if (!refreshToken || refreshToken !== token) {
      throw new Error("refresh token Error");
    }
    const accessToken = this.tokenCreate(true, user);
    return { accessToken };
  }
}

const userService = new UserService();

export { userService };
