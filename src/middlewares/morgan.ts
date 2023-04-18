import dotenv from "dotenv";
import morgan from "morgan";
import { logger } from "../utils/winston";
dotenv.config();
const stream = {
  write: (message: string) => {
    logger.info(message);
  },
};
const skip = () => {
  return process.env.NODE_ENV !== "development";
};

export const morganMiddleware = morgan("dev", { stream, skip });
