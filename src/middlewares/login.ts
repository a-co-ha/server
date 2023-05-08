import { mysqlTransaction } from "./../db/mysqlTransaction";
import axios, { AxiosResponse } from "axios";
import {
  GITHUBACCESSURL,
  GITHUBUSERURL,
  oauthClient,
  oauthClientLOCAL,
  oauthSecretLOCAL,
  oauthSecret,
} from "../config";
import { User } from "../interface";
import { userService } from "../services";
import { ErrorType } from "../constants";
import { errorResponse } from "../utils";

export const githubLogin = async (req, res, next) => {
  const origin = req.headers.origin;

  let id = oauthClient;
  let secret = oauthSecret;
  if (origin === "http://localhost:3001") {
    id = oauthClientLOCAL;
    secret = oauthSecretLOCAL;
  }
  const requestToken = req.query.code;
  try {
    const response: AxiosResponse = await axios.post(
      GITHUBACCESSURL,
      {},
      {
        headers: {
          accept: `application/json`,
        },
        params: {
          client_id: id,
          client_secret: secret,
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
        await mysqlTransaction.execute(async (t) => {
          await userService.insert(t, user);
        });
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
