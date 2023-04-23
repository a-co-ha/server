import { ChannelAttributes, userHasChannels } from "./../interface/index";
import { Channel } from "./../model/channel";
import { UserAttributes } from "../interface";
import { User, userModel } from "../model/user";
import { ChannelUser } from "../model/channelUser";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config";
import { Op } from "sequelize";
import { channelService, ChannelService } from "./channelService";
import { sequelize } from "../db/sequelize";

export class UserService {
  constructor(private user: User, private channelService: ChannelService) {}
  private tokenCreate = (
    isAccess: boolean,
    payload: UserAttributes
  ): string => {
    return jwt.sign(payload, jwtSecret, {
      expiresIn: isAccess ? "1h" : "24h",
    });
  };

  public async login(user: UserAttributes, sessionID: string): Promise<any> {
    const accessToken = this.tokenCreate(true, user);
    const refreshToken = this.tokenCreate(false, user);

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
    return { token: { accessToken, refreshToken }, user, sessionID };
  }
  public async getChannelMembersID(userId: number): Promise<number[]> {
    const channelId = await this.channelService
      .getChannels(userId)
      .then((channels) => channels.map((channel) => channel.channelId));

    return await ChannelUser.findAll({
      where: {
        channelId: { [Op.in]: channelId },
      },
      raw: true,
      attributes: [[sequelize.literal("DISTINCT user_id"), "userId"]],
    }).then((res) => res.map((res) => res.userId));
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

export const userService = new UserService(userModel, channelService);
