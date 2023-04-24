import dotenv from "dotenv";
import winston from "winston";
import winstonDaily from "winston-daily-rotate-file";
import { dateFormat } from "../constants";

const { combine, timestamp, printf, colorize } = winston.format;
dotenv.config();
const logDir = "logs";

const logFormat = printf((info) => {
  return `${info.timestamp} [ ${info.level} ] ▶ ${info.message}`;
});

export const logger = winston.createLogger({
  format: combine(
    timestamp({
      format: dateFormat,
    }),
    logFormat
  ),
  transports: [
    new winstonDaily({
      level: "info",
      datePattern: "YY-MM-DD",
      dirname: logDir,
      filename: `%DATE%.log`,
      maxFiles: 30,
      zippedArchive: true,
    }),

    new winstonDaily({
      level: "warn",
      datePattern: "YY-MM-DD",
      dirname: logDir + "/warn",
      filename: `%DATE%.warn.log`,
      maxFiles: 30,
      zippedArchive: true,
    }),

    new winstonDaily({
      level: "error",
      datePattern: "YY-MM-DD",
      dirname: logDir + "/error",
      filename: `%DATE%.error.log`,
      maxFiles: 30,
      zippedArchive: true,
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize({ all: true }), logFormat),
    })
  );
}
