import axios from "axios";
import { githubHeader } from "../constants";
import { Octokit } from "octokit";
import { GITHUBAUTH } from "../config";
import { AsyncRequestHandler } from "../utils";
import { channelService } from "../services";
const octokit = new Octokit({
  auth: GITHUBAUTH,
});
interface IGithubController {
  getOrg: AsyncRequestHandler;
  getIssue: AsyncRequestHandler;
  getIssueDetail: AsyncRequestHandler;
}
export class GithubController implements IGithubController {
  getRepo: AsyncRequestHandler = async (req, res) => {
    const { githubID } = req.user;
    const { repo } = req.body;
    const result = await octokit.request("GET /repos/{owner}/{repo}", {
      owner: githubID,
      repo,
      headers: githubHeader,
    });

    const {
      name,
      private: IsPrivate,
      description,
      url: html_url,
    } = result.data;

    res.json({
      name,
      private: IsPrivate,
      description,
      url: html_url,
    });
  };

  getRepos: AsyncRequestHandler = async (req, res) => {
    const { githubID } = req.user;
    const response = await octokit.request("GET /users/{owner}/repos", {
      owner: githubID,
      headers: githubHeader,
    });

    const { data } = response;
    const result = data.map((el) => {
      return {
        name: el.name,
        isPrivate: el.private,
        description: el.description,
        url: el.html_url,
      };
    });
    res.json(result);
  };

  getOrg: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const { org } = req.body;

    const result = await octokit.request("GET /orgs/{org}", {
      org,
      headers: githubHeader,
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
      channelService.channelOrgAdd(channelId, orgName);
      res.json({ orgName, orgUrl, orgImg, desc, repos });
    });
  };

  getEvents: AsyncRequestHandler = async (req, res) => {
    const { org } = req.body;
    const { data } = await octokit.request("GET /orgs/{org}/events", {
      org,
      headers: githubHeader,
    });
    res.json(data);
  };

  getIssue: AsyncRequestHandler = async (req, res) => {
    const { org, repo } = req.body;
    const { data } = await octokit.request(
      "GET /repos/{org}/{repo}/issues?state=all",
      {
        org,
        repo,
        headers: githubHeader,
      }
    );

    const result = data.map((i) => {
      const labels = i.labels.map((el) => {
        return { name: el.name, color: el.color, desc: el.description };
      });

      return {
        url: i.html_url,
        title: i.title,
        user: { name: i.user.login, img: i.user.avatar_url },
        labels,
        state: i.state,
        createAt: i.created_at,
        updateAt: i.updated_at,
        closeAt: i.closed_at,
        body: i.body,
      };
    });
    res.json(result);
  };

  getIssueDetail: AsyncRequestHandler = async (req, res) => {
    const number = req.query.issue_number;
    const { org, repo } = req.body;

    const { data } = await octokit.request(
      "GET /repos/{org}/{repo}/issues/{number}/comments",
      {
        org,
        repo,
        number,
        headers: githubHeader,
      }
    );

    const result = data.map((i) => {
      return {
        user: { name: i.user.login, img: i.user.avatar_url },
        createAt: i.created_at,
        updateAt: i.updated_at,
        body: i.body,
      };
    });
    result.url = data.issue_url;
    res.json(result);
  };

  createIssue: AsyncRequestHandler = async (req, res) => {
    const { org, repo, title, body, assignees, milestone, labels } = req.body;
    const { data } = await octokit.request("POST /repos/{org}/{repo}/issues", {
      org,
      repo,
      title,
      body,
      assignees,
      milestone,
      labels,
      headers: githubHeader,
    });
    res.json(data);
  };
}

const githubController = new GithubController();
export { githubController };
