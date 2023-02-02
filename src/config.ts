import dotenv from "dotenv";

const envFound = dotenv.config();

if (envFound.error) {
  throw new Error("Couldn't find .env file");
}

const port = parseInt(process.env.PORT ?? "8080", 10);
const mongoDBUri = process.env.DB_MONGO || "not found";
const host = process.env.HOST || "localhost";

const NEXT_PUBLIC_API_MOCKING = process.env.NEXT_PUBLIC_API_MOCKING;
const NEXT_PUBLIC_APP_GITHUB_OAUTH_CLIENT_ID =
  process.env.NEXT_PUBLIC_APP_GITHUB_OAUTH_CLIENT_ID;
const NEXT_PUBLIC_APP_GITHUB_OAUTH_CLIENT_SECRET =
  process.env.NEXT_PUBLIC_APP_GITHUB_OAUTH_CLIENT_SECRET;
const NEXT_PUBLIC_APP_GITHUB_OAUTH_REDIRECT_URL =
  process.env.NEXT_PUBLIC_APP_GITHUB_OAUTH_REDIRECT_URL;

export {
  port,
  mongoDBUri,
  host,
  NEXT_PUBLIC_API_MOCKING,
  NEXT_PUBLIC_APP_GITHUB_OAUTH_CLIENT_ID,
  NEXT_PUBLIC_APP_GITHUB_OAUTH_CLIENT_SECRET,
  NEXT_PUBLIC_APP_GITHUB_OAUTH_REDIRECT_URL,
};
