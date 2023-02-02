import { uuid } from "uuidv4";
import axios from "axios";
import {
  NEXT_PUBLIC_API_MOCKING,
  NEXT_PUBLIC_APP_GITHUB_OAUTH_CLIENT_ID,
  NEXT_PUBLIC_APP_GITHUB_OAUTH_CLIENT_SECRET,
  NEXT_PUBLIC_APP_GITHUB_OAUTH_REDIRECT_URL,
} from "../config";
import { connected } from "process";
export const githubLoginPage = (req: any, res: any) => {
  const rootURl = "https://github.com/login/oauth/authorize";

  const options = {
    client_id: NEXT_PUBLIC_APP_GITHUB_OAUTH_CLIENT_ID as string,
    redirect_uri: NEXT_PUBLIC_APP_GITHUB_OAUTH_REDIRECT_URL as string,
    scope: "read:user",
    state: uuid(),
  };

  const qs = new URLSearchParams(options);

  const result = `${rootURl}?${qs.toString()}`;
  return res.redirect(result);
};

export const githubLoginWithServer = async (req: any, res: any) => {
  const { code } = req.query;

  const baseUrl = "https://github.com/login/oauth/access_token";
  const body = {
    client_id: NEXT_PUBLIC_APP_GITHUB_OAUTH_CLIENT_ID as string,
    client_secret: NEXT_PUBLIC_APP_GITHUB_OAUTH_CLIENT_SECRET as string,
    code,
  };

  try {
    const finalUrl = baseUrl;

    const { data: requestToken } = await axios.post(finalUrl, body, {
      headers: { Accept: "application/json" },
    });
 
    /// todo 디비에 저장 (login, name, avatar_url, html_url)
    const { access_token } = requestToken;
    console.log(access_token);
    const apiUrl = "https://api.github.com";
    const { data: userdata } = await axios.get(`${apiUrl}/user`, {
      headers: { Authorization: `token ${access_token}` },
    });

    return userdata;
  } catch (err: any) {
    throw Error(err);
  }
};