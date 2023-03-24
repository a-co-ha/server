import dotenv from "dotenv";
import { redisCli, redisClient } from "./utils/redisClient";
import RedisStore from "connect-redis";

const envFound = dotenv.config();

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
export const s3keyId = process.env.S3KEYID;
export const s3accesskey = process.env.S3ACCESSKEY;
export const s3region = process.env.REGION;
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = parseInt(process.env.REDIS_PORT ?? "10035");
export const REDIS_USERNAME = process.env.REDIS_USERNAME;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
export const REDIS_TIME_TO_LIVE = parseInt(
  process.env.REDIS_TIME_TO_LIVE ?? "300"
);
export const SESSION_SECRET = process.env.SESSION_SECRET;
export const GITHUBAUTH = process.env.GITHUBAUTH;
export const GITHUBACCESSURL = process.env.GITHUBACCESSURL;
export const GITHUBUSERURL = process.env.GITHUBUSERURL;
export const config = {
  development: {
    username: mysqlUser,
    password: mysqlPassword,
    database: mysqlDataBase,
    host: mysqlHost,
    port: mysqlPort,
    dialect: process.env.TYPEORM_CONNECTION,
  },
};

export const sessionConfig = {
  store: new RedisStore({
    client: redisCli,
    ttl: REDIS_TIME_TO_LIVE,
    prefix: "login:",
  }),
  cookie: {
    //세션 쿠키 설정 (세션 관리 시 클라이언트에 보내는 쿠키)
    httpOnly: true, // 자바스크립트를 통해 세션 쿠키를 사용할 수 없도록 함
    Secure: true
  },
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true, // 세션에 저장할 내역이 없더라도 처음부터 세션을 생성할지 설정
  secure: true, // https 환경에서만 session 정보를 주고받도록처리
};
