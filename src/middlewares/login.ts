import axios from "axios";
import { oauthClient, oauthSecret } from "../config";
import { UserAttributes } from "../interface";
import { userService } from "../services";

export const githubLogin = async (req, res, next) => {
  const requestToken = req.query.code;
  axios({
    method: "post",
    url: `https://github.com/login/oauth/access_token?client_id=${oauthClient}&client_secret=${oauthSecret}&code=${requestToken}`,

    headers: {
      accept: "application/json",
    },
  }).then((response: any) => {
    const access_token = response.data.access_token;

    axios({
      method: "get",
      url: `https://api.github.com/user`,
      headers: {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        Authorization: "token " + access_token,
      },
    }).then(async (response) => {
      const {
        name,
        login: githubID,
        html_url: githubURL,
        avatar_url: img,
      } = response.data;
      const user: UserAttributes = { name, githubID, githubURL, img };
      const isGuest = await userService.get(user);
      if (isGuest.length === 0) {
        await userService.insert(user);
      }
      req.user = user;
      next();
    });
  });
};
