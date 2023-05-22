import mongoose from "mongoose";
import { mongoDBUri } from "../config";
import { logger } from "../utils";

export class MongoAdapter {
  constructor() {
    this.mongo();
  }

  private mongo() {
    mongoose.set("strictQuery", true);
    mongoose.connect(mongoDBUri);
    mongoose.connection.on("connected", () => {
      logger.info(`connected to MongoDB`);
    });
  }
}
