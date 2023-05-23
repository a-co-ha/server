import { Sequelize } from "sequelize";
import {
  dialect,
  mysqlDataBase,
  mysqlHost,
  mysqlPassword,
  mysqlUser
} from "../config";
import { logger } from "../utils/winston";

export const sequelize = new Sequelize(
  mysqlDataBase,
  mysqlUser,
  mysqlPassword,
  {
    host: mysqlHost,
    dialect,
    timezone: "+09:00",
  }
);

export const connectSequelize = async () => {
  try {
    await sequelize.authenticate().then(() => {
      logger.info("sequelize connection success");
    });
    await sequelize.sync().then(() => {
      logger.info("sequelize sync success");
    });
  } catch (err) {
    logger.error(err);
  }
};
