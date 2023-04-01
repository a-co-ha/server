import { LogColor } from "../constants";
import mongoose from "mongoose";
import { mongoDBUri } from "../config";

export class MongoAdapter {
  constructor() {
    this.mongo();
  }

  private mongo() {
    mongoose.set("strictQuery", true);
    mongoose.connect(mongoDBUri);
    mongoose.connection.on("connected", () => {
      console.info(LogColor.INFO, `connected to MongoDB`);
    });
  }
}
