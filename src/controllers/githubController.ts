import { errorResponse } from "./../utils/errorResponse";
import axios from "axios";
import { AsyncRequestHandler } from "../types";
import { Octokit } from "octokit";
import { GITHUBAUTH } from "../config";
import { response } from "express";
const headers = {
  Accept: "application/vnd.github.v3+json",
  "X-GitHub-Api-Version": "2022-11-28",
};
interface IGithubController {
  getOrg: AsyncRequestHandler;
  getIssue: AsyncRequestHandler;
}
export class GithubController implements IGithubController {
  getOrg: AsyncRequestHandler = async (req, res) => {
    const octokit = new Octokit({
      auth: GITHUBAUTH,
    });
    const org = req.body.org;
    const result = await octokit.request("GET /orgs/{org}", {
      org: org,
      headers: headers,
    });
    const { data } = result;
    const orgImg = data.avatar_url;
    const desc = data.description;
    const orgUrl = data.html_url;
    const orgName = data.login;

    axios({
      method: "get",
      url: data.repos_url,
    }).then((response) => {
      const repos = response.data.map((i) => {
        return { name: i.name, url: i.url };
      });

      res.json({ orgName, orgUrl, orgImg, desc, repos });
    });

    // const event = axios({
    //   method: "get",
    //   url: data.events_url,
    // }).then((res) => res.data);
  };

  getIssue: AsyncRequestHandler = async (req, res) => {
    const octokit = new Octokit({
      auth: GITHUBAUTH,
    });
    const org = req.body.org;
    const result = await octokit.request("GET /orgs/{org}/issues", {
      org: org,
      headers: headers,
    });
    res.json(result);
  };
}

const githubController = new GithubController();
export { githubController };
