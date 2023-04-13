import { LogColor } from "../constants";
import mongoose from "mongoose";
import { mongoDBUri } from "../config";
import MongoClient from "mongoclient";

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

  async startTransaction() {
    await mongoose.startSession();
    const session = await mongoose.connection.startSession();
    session.startTransaction();
    return session;
  }

  async commitTransaction(session) {
    await session.commitTransaction();
    session.endSession();
  }

  async abortTransaction(session) {
    await session.abortTransaction();
    session.endSession();
  }
}
