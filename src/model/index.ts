import { Sequelize } from "sequelize";
import { config } from "../config";
export * from "./postModel";
export * from "./userModel";
export * from "./progressModel";
export * from "./channelModel";
export const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    dialect: "mysql",
  }
);
