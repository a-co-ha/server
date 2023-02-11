import dotenv from "dotenv";

const envFound = dotenv.config();

if (envFound.error) {
  throw new Error("Couldn't find .env file");
}

export const port = parseInt(process.env.PORT ?? "8080", 10);
export const mongoDBUri = process.env.DB_MONGO || "not found";
export const mysqlHost = process.env.DB_NAME || "localhost";
export const oauthClient = process.env.GITHUB_OAUTH_CLIENT_ID;
export const oauthSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
export const oauthRedirect = process.env.GITHUB_OAUTH_REDIRECT_URL;
export const jwtSecret = process.env.JWT_SECRET || "JWT_SECRET";
export const mysqlPort = parseInt(process.env.MYSQL_PORT ?? "3306");
export const mysqlUser = process.env.MYSQL_USER;
export const mysqlPassword = process.env.MYSQL_PASSWORD;
export const mysqlDataBase = process.env.MYSQL_DATABASE;
export const inviteApi = process.env.INVITE_URL;
