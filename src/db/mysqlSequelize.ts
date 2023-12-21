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

// export const connectSequelize = async () => {
//   try {
//     await sequelize.authenticate().then(() => {
//       logger.info("sequelize connection success");
//     });
//     await sequelize.sync().then(() => {
//       logger.info("sequelize sync success");
//     });
//   } catch (err) {
//     logger.error(err);
//   }
// };
export const connectSequelize = async () => {
  try {
    // 데이터베이스 인증
    await sequelize.authenticate();
    logger.info("Sequelize connection success");

    // 모델과 데이터베이스 스키마 동기화
    await sequelize.sync();
    // await sequelize.sync({ force: true });
    logger.info("Sequelize sync success");
  } catch (err) {
    logger.error("Sequelize connection or sync error:", err);
  }
};
