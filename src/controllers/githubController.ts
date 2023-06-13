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
    const { repo, type } = req.body;

    const { data } = await octokit.request("GET /repos/{owner}/{repo}", {
      owner: githubID,
      repo,
      headers: githubHeader,
    });

    const { name, description: desc, url: html_url } = data;

    res.json({
      type,
      name,
      url: html_url,
      desc,
    });
  };

  getRepos: AsyncRequestHandler = async (req, res) => {
    const { githubID } = req.user;
    const response = await octokit.request("GET /users/{owner}/repos", {
      owner: githubID,
      headers: githubHeader,
    });
    console.log(response);

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
    const { org, type } = req.body;

    const result = await octokit.request("GET /orgs/{org}", {
      org,
      headers: githubHeader,
    });
    const {
      avatar_url: img,
      description: desc,
      html_url: url,
      login: name,
      repos_url,
    } = result.data;
    const repos = await axios.get(repos_url).then((response) => {
      return response.data.map((i) => {
        return { name: i.name, url: i.url };
      });
    });

    res.json({ type, name, url, desc, img, repos });
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

  getRepoCommits: AsyncRequestHandler = async (req, res) => {
    const { githubID } = req.user;
    const { org, owner, repo } = req.body;
    const admin = githubID;

    const { data } = await octokit.request(
      "GET /repos/{admin}/{repo}/commits",
      {
        admin,
        repo,
        headers: githubHeader,
      }
    );

    res.json(data);
  };

  getCommits: AsyncRequestHandler = async (req, res) => {
    const { org, owner, repo } = req.body;
    const admin = org ? org : owner;

    const { data } = await octokit.request("GET /repos/{admin}/{repo}/events", {
      admin,
      repo,
      headers: githubHeader,
    });

    const events = data.filter((event) => event.type === "PushEvent");
    const filteredEvent = events.slice(0, 8);
    const result = await Promise.all(
      filteredEvent.map(async (event) => {
        if (event.payload.commits.length > 1) {
          const { head } = event.payload;
          const { data } = await octokit.request(
            "GET /repos/{admin}/{repo}/commits/{head}",
            {
              admin,
              repo,
              head,
              headers: githubHeader,
            }
          );
          event.payload.commits = [
            { author: data.commit.author, message: data.commit.message },
          ];
        }
        return event;
      })
    );

    res.json(result);
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
    const issues = data.filter((el) => el.pull_request === undefined);

    const result = issues.slice(0, 8).map((i) => {
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
      req.body.type = gitHubType.ORG;
      this.getOrg(req, res);
    } else {
      req.body.repo = repoName;
      req.body.type = gitHubType.REPO;
      this.getRepo(req, res);
    }
  };
}

const githubController = new GithubController();
export { githubController };
