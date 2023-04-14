import dotenv from "dotenv";
import winston from "winston";
import winstonDaily from "winston-daily-rotate-file";

import path from "path";
const { combine, timestamp, printf, colorize } = winston.format;
dotenv.config();
const logDir = path.join(__dirname, "logs");

const logFormat = printf((info) => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

export const logger = winston.createLogger({
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    logFormat
  ),
  transports: [
    new winstonDaily({
      level: "info",
      datePattern: "YYYY-MM-DD",
      dirname: logDir,
      filename: `%DATE%.log`,
      maxFiles: 30,
      zippedArchive: true,
    }),

    new winstonDaily({
      level: "warn",
      datePattern: "YYYY-MM-DD",
      dirname: logDir + "/warn",
      filename: `%DATE%.warn.log`,
      maxFiles: 30,
      zippedArchive: true,
    }),

    new winstonDaily({
      level: "error",
      datePattern: "YYYY-MM-DD",
      dirname: logDir + "/error", // error.log 파일은 /logs/error 하위에 저장
      filename: `%DATE%.error.log`,
      maxFiles: 30,
      zippedArchive: true,
    }),
  ],
});
logger.stream = {
  write: (message) => {
    logger.info(message);
  },
};

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }), // console 에 출력할 로그 컬러 설정 적용함
        logFormat // log format 적용
      ),
    })
  );
}
