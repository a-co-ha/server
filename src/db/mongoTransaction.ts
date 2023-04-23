import mongoose, { ClientSession } from "mongoose";

export class MongoTransaction {
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

  async withTransaction<T>(
    fn: (session: ClientSession) => Promise<T>
  ): Promise<T> {
    const session = await this.startTransaction();
    try {
      const result = await fn(session);
      await this.commitTransaction(session);
      return result;
    } catch (error) {
      await this.abortTransaction(session);
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export const mongoTransaction = new MongoTransaction();
