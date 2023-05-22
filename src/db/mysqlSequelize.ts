import { Sequelize } from "sequelize";
import {
  mysqlDataBase,
  mysqlUser,
  mysqlPassword,
  dialect,
  mysqlHost,
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
    await sequelize.sync();
  } catch (err) {
    logger.error(err);
  }
};
