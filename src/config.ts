import dotenv from "dotenv";

const envFound = dotenv.config();

if (envFound.error) {
  throw new Error("Couldn't find .env file");
}

const port = parseInt(process.env.PORT ?? "8080", 10);
const TYPEORM_CONNECTION = process.env.TYPEORM_CONNECTION ?? "mysql";
const TYPEORM_HOST = process.env.TYPEORM_HOST;
const TYPEORM_USERNAME = process.env.TYPEORM_USERNAME;
const TYPEORM_PASSWORD = process.env.TYPEORM_PASSWORD;
const TYPEORM_DATABASE = process.env.TYPEORM_DATABASE;
const TYPEORM_PORT = parseInt(process.env.TYPEORM_PORT ?? "3306");
const TYPEORM_SYNCHRONIZE = process.env.TYPEORM_SYNCHRONIZE;
const TYPEORM_LOGGING = process.env.TYPEORM_LOGGING;
const TYPEORM_ENTITIES = process.env.TYPEORM_ENTITIES;

export {
  port,
  TYPEORM_CONNECTION,
  TYPEORM_HOST,
  TYPEORM_USERNAME,
  TYPEORM_PASSWORD,
  TYPEORM_DATABASE,
  TYPEORM_PORT,
  TYPEORM_SYNCHRONIZE,
  TYPEORM_LOGGING,
  TYPEORM_ENTITIES,
};
