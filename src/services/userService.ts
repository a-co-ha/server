import { Channel } from "./../model/channel";
import { setUserToken } from "./../utils/jwt";
import { UserAttributes } from "../interface";
import { User } from "../model/user";
import { ChannelUser } from "../model/channelUser";
export class UserService {
  async login(user: any) {
    const { accessToken, refreshToken } = setUserToken(user);
    return { user, accessToken, refreshToken };
  }

  async get(user: UserAttributes) {
    const { name, githubID, githubURL, img } = user;
    return await User.findAll({
      include: {
        model: ChannelUser,
        as: "userHasChannels",
        include: [
          {
            model: Channel,
            required: false,
          },
        ],
        attributes: ["channel_id"],
      },

      where: { name, githubID, githubURL, img },
      raw: true,
      attributes: ["github_id", "github_url", "img", "name"],
    });
  }

  async insert(user: UserAttributes) {
    // await User.create(user);
  }
}

const userService = new UserService();

export { userService };
