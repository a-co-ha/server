import axios from "axios";
import { Octokit } from "octokit";
import { GITHUBAUTH } from "../config";
import { githubHeader, gitHubType } from "../constants";
import { channelService } from "../services";
import { AsyncRequestHandler } from "../utils";

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
    const { data } = await octokit.request("GET /repos/{owner}/{repo}", {
      owner: githubID,
      repo,
      headers: githubHeader,
    });

    const {
      name,
      private: IsPrivate,
      description: desc,
      url: html_url,
      language,
    } = data;

    res.json({
      name,
      private: IsPrivate,
      desc,
      url: html_url,
      language,
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
        desc: el.description,
        url: el.html_url,
      };
    });
    res.json(result);
  };

  getOrg: AsyncRequestHandler = async (req, res) => {
    // const channel = req.query.channel as string;
    // const channelId = parseInt(channel);
    const { org } = req.body;

    const result = await octokit.request("GET /orgs/{org}", {
      org,
      headers: githubHeader,
    });
    const {
      avatar_url: orgImg,
      description: desc,
      html_url: orgUrl,
      login: orgName,
      repos_url,
    } = result.data;
    const repos = await axios.get(repos_url).then((response) => {
      return response.data.map((i) => {
        return { name: i.name, url: i.url };
      });
    });

    res.json({ orgName, orgUrl, orgImg, desc, repos });
  };

  getOrgs: AsyncRequestHandler = async (req, res) => {
    const { githubID } = req.user;

    const { data } = await octokit.request("GET /users/{owner}/orgs", {
      owner: githubID,
      headers: githubHeader,
    });
    const result = data.map(
      ({
        login: name,
        id: orgID,
        description: desc,
        avatar_url,
        html_url,
      }) => ({
        name,
        orgID,
        url: html_url,
        orgImg: avatar_url,
        desc,
      })
    );

    res.json(result);
  };
  getCommits: AsyncRequestHandler = async (req, res) => {
    const { org, owner, repo } = req.body;
    const admin = org ? org : owner;

    const perPage = 100;
    const maxResults = 5;

    let page = 1;
    let resultsCount = 0;
    let filteredEvents = [];
    while (resultsCount < maxResults) {
      const { data } = await octokit.request(
        "GET /repos/{admin}/{repo}/events",
        {
          admin,
          repo,
          headers: githubHeader,
        }
      );

      const events = data.filter((event) => event.type === "PushEvent");
      filteredEvents = filteredEvents.concat(events);
      resultsCount = filteredEvents.length;

      page++;

      if (data.length < perPage) {
        // Reached the last page, exit the loop
        break;
      }
    }
    filteredEvents = filteredEvents.slice(0, maxResults);
    res.json(filteredEvents);
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
    const { org, owner, repo } = req.body;
    const admin = org ? org : owner;

    const { data } = await octokit.request(
      "GET /repos/{admin}/{repo}/issues?state=all",
      {
        admin,
        repo,
        headers: githubHeader,
      }
    );

    const result = data.slice(0, 5).map((i) => {
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
  register: AsyncRequestHandler = async (req, res) => {
    const { channelId, repoName, repoType } = req.body;
    if (!(repoType === gitHubType.ORG || repoType === gitHubType.REPO)) {
      throw new Error("정상적인 타입이 아닙니다.");
    }
    await channelService.channelRepoAdd(channelId, repoName, repoType);

    if (repoType === gitHubType.ORG) {
      req.body.org = repoName;
      this.getOrg(req, res);
    } else {
      req.body.repo = repoName;
      this.getRepo(req, res);
    }
  };
}

const githubController = new GithubController();
export { githubController };
