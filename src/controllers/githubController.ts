import axios from "axios";
import { AsyncRequestHandler } from "../types";
import { Octokit } from "octokit";
import { GITHUBAUTH } from "../config";

const headers = {
  Accept: "application/vnd.github.v3+json",
  "X-GitHub-Api-Version": "2022-11-28",
};
interface IGithubController {
  getOrg: AsyncRequestHandler;
  getIssue: AsyncRequestHandler;
  getIssueDetail: AsyncRequestHandler;
}
export class GithubController implements IGithubController {
  getOrg: AsyncRequestHandler = async (req, res) => {
    const octokit = new Octokit({
      auth: GITHUBAUTH,
    });
    const { org } = req.body;
    const result = await octokit.request("GET /orgs/{org}", {
      org,
      headers,
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
  };

  getEvents: AsyncRequestHandler = async (req, res) => {
    const octokit = new Octokit({
      auth: GITHUBAUTH,
    });
    const { org } = req.body;
    const { data } = await octokit.request("GET /orgs/{org}/events", {
      org,
      headers,
    });
    res.json(data);
  };

  // getIssue: AsyncRequestHandler = async (req, res) => {
  //   const octokit = new Octokit({
  //     auth: GITHUBAUTH,
  //   });
  //   const org = req.body.org;
  //   const { data } = await octokit.request(
  //     "GET /repos/{org}/{repo}/issues/comments",
  //     {
  //       org :org,
  //       owner: "AhGnuesHo",
  //       repo: "server",
  //       headers: headers,
  //     }
  //   );
  //   res.json(data);
  // };

  getIssue: AsyncRequestHandler = async (req, res) => {
    const octokit = new Octokit({
      auth: GITHUBAUTH,
    });
    const { org, repo } = req.body;
    const { data } = await octokit.request(
      "GET /repos/{org}/{repo}/issues?state=all",
      {
        org,
        repo,
        headers,
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
    const octokit = new Octokit({
      auth: GITHUBAUTH,
    });
    const number = req.query.issue_number;
    const { org, repo } = req.body;

    const { data } = await octokit.request(
      "GET /repos/{org}/{repo}/issues/{number}/comments",
      {
        org,
        repo,
        number,
        headers,
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
    const octokit = new Octokit({
      auth: GITHUBAUTH,
    });
    const { org, repo, title, body, assignees, milestone, labels } = req.body;
    const { data } = await octokit.request("POST /repos/{org}/{repo}/issues", {
      org,
      repo,
      title,
      body,
      assignees,
      milestone,
      labels,
      headers,
    });
    res.json(data);
  };
}

const githubController = new GithubController();
export { githubController };
