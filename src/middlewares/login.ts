/* eslint-disable @typescript-eslint/restrict-plus-operands */
import axios from "axios";
import { GITHUBACCESSURL, GITHUBUSERURL, oauthClient, oauthSecret } from "../config";
import { UserAttributes } from "../interface";
import { userService } from "../services";

export const githubLogin = async (req, res, next) => {
  const requestToken = req.query.code;
  try {
 const response = await axios.post(
      `https://github.com/login/oauth/access_token?client_id=${oauthClient}&client_secret=${oauthSecret}&code=${requestToken}`,
      {},
      {
        headers: {
          accept: `application/json`,
        },
      }
    );

    const access_token = response.data.access_token;
    try {
      const { data } = await axios.get(`https://api.github.com/user`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const {
        id,
        name,
        login: githubID,
        html_url: githubURL,
        avatar_url: img,
      } = data;

      const user: UserAttributes = {
        userId: id,
        name,
        githubID,
        githubURL,
        img,
      };

      const isGuest = await userService.get(id);

      if (!isGuest) {
        await userService.insert(user);
      }

      req.user = user;
      next();
    } catch (e: any) {
      console.log(requestToken);
      throw new Error(e);
    }
  } catch (e: any) {
       console.log(requestToken);
    throw new Error(e);
  }
};
