import dotenv from "dotenv";

import { SessionOptions } from "express-session";

import RedisStore from "connect-redis";
import { redisClient } from "./utils/redisClient";
import { Dialect } from "sequelize";
const envFound = dotenv.config();

export const port = parseInt(process.env.PORT ?? "8080", 10);
export const mongoDBUri = process.env.DB_MONGO || "not found";
export const mysqlHost = process.env.DB_NAME || "localhost";
export const oauthClient = process.env.GITHUB_OAUTH_CLIENT_ID;
export const oauthRedirect = process.env.GITHUB_OAUTH_REDIRECT_URL;
export const oauthSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
export const oauthClientLOCAL = process.env.GITHUB_OAUTH_CLIENT_ID_LOCAL;
export const oauthSecretLOCAL = process.env.GITHUB_OAUTH_CLIENT_SECRET_LOCAL;
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
export const dialect = process.env.TYPEORM_CONNECTION as Dialect;
export const REDIS_TIME_TO_LIVE = parseInt(
  process.env.REDIS_TIME_TO_LIVE ?? "300"
);
export const SESSION_SECRET = process.env.SESSION_SECRET;
export const GITHUBAUTH = process.env.GITHUBAUTH;
export const GITHUBACCESSURL = process.env.GITHUBACCESSURL;
export const GITHUBUSERURL = process.env.GITHUBUSERURL;

export const sessionConfig = {
  store: new RedisStore({
    client: redisClient,
    ttl: REDIS_TIME_TO_LIVE,
    prefix: "session:",
  }),
  cookie: {
    httpOnly: true, // 자바스크립트를 통해 세션 쿠키를 사용할 수 없도록 함 localhost, ip일때는 쓰면 안된다. 저장안됨
    sameSite: "none",
    secure: true,
    domain: ".acoha.store",
  },
  credentials: true,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false, // 세션에 저장할 내역 없으면 저장안함
} as SessionOptions;

export const corsOrigin = [
  "http://localhost:3001/",
  "https://acoha.site/",
  "https://npm.acoha.site/",
  "https://acoha.store/",
  "http://3.35.132.30:3000",
];

export const ioCorsOptions = {
  allowUpgrades: true,
  cors: {
    origin: [
      "http://localhost:3001",
      "https://acoha.store",
      "https://acoha.site",
    ],
    methods: ["GET"],
    allowedHeaders: ["Authorization"],
    credentials: true,
  },
};

export const corsOptions = {
  origin: [
    "http://localhost:3001",
    "https://acoha.store",
    "https://acoha.site",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  optionsSuccessStatus: 200,
};
