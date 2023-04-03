import axios from "axios";
import {
  GITHUBACCESSURL,
  GITHUBUSERURL,
  oauthClient,
  oauthSecret,
} from "../config";
import { User, UserAttributes } from "../interface";
import { userService } from "../services";
import { ErrorType } from "../constants";
import { errorResponse } from "../utils";

export const githubLogin = async (req, res, next) => {
  const requestToken = req.query.code;
  try {
    const response = await axios.post(
      GITHUBACCESSURL,
      {},
      {
        headers: {
          accept: `application/json`,
        },
        params: {
          client_id: oauthClient,
          client_secret: oauthSecret,
          code: requestToken,
        },
      }
    );

    const access_token = response.data.access_token;
    try {
      const { data } = await axios.get(GITHUBUSERURL, {
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

      const displayName = name ?? githubID;

      const user: User = {
        userId: id,
        name: displayName,
        githubID,
        githubURL,
        img,
      };

      const isGuest = await userService.getUserWithChannels(id);

      if (!isGuest) {
        await userService.insert(user);
      }

      req.user = user;
      next();
    } catch (e: any) {
      errorResponse(res, ErrorType.BADREQUEST, requestToken);
    }
  } catch (e: any) {
    errorResponse(res, ErrorType.BADREQUEST, requestToken);
  }
};
