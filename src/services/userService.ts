import { sequelize } from "./../model/index";
import {
  ChannelAttributes,
  userHasChannels,
  userToken,
} from "./../interface/index";
import { Channel } from "./../model/channel";
import { UserAttributes } from "../interface";
import { User, userModel } from "../model/user";
import { ChannelUser } from "../model/channelUser";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config";
import { connectSocket } from "../utils/connectSocket";

export class UserService {
  constructor(private user: User) {}
  private tokenCreate = (
    isAccess: boolean,
    payload: UserAttributes
  ): string => {
    return jwt.sign(payload, jwtSecret, {
      expiresIn: isAccess ? "1h" : "3h",
    });
  };

  public async login(sessionId: string, user: UserAttributes): Promise<any> {
    const accessToken = this.tokenCreate(true, user);
    const refreshToken = this.tokenCreate(false, user);

    // await connectSocket(sessionId, user);
    await User.update(
      {
        refreshToken,
      },
      {
        where: {
          userId: user.userId,
        },
      }
    );
    return { token: { accessToken, refreshToken }, user, sessionId };
  }

  public async getUserWithChannels(
    id: number
  ): Promise<userHasChannels | null> {
    const user = await User.findByPk(id, {
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
      attributes: ["userId", "githubID", "githubURL", "img", "name"],
    });

    if (!user) {
      return null;
    }

    const { userId, githubID, githubURL, img, name, ...rest } = user.dataValues;

    const channels: ChannelAttributes[] =
      rest["userHasChannels"]?.map(
        (i: any) => i?.dataValues?.channel?.dataValues
      ) || [];

    return {
      userId,
      name: name || githubID,
      githubID,
      githubURL,
      img,
      channels,
    };
  }

  public async insert(user: UserAttributes): Promise<void> {
    await User.create(user);
  }

  public async expandAccToken(
    token: string,
    user: UserAttributes
  ): Promise<{ accessToken: string }> {
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

export const userService = new UserService(userModel);
