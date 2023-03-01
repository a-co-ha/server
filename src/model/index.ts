import { Model, model } from "mongoose";
import { Sequelize } from "sequelize";
import { config } from "../config";
import { PostInterface, PostSchema } from "./schema/postSchema";
import { ProgressInterface, ProgressSchema } from "./schema/progressSchema";
export * from "./schema/progressSchema";

interface ModelIdentifierInterface {
  post: string;
  progress: string;
}
export const modelIdentifier: ModelIdentifierInterface = {
  post: "post",
  progress: "progress",
};

export const postModel = model<PostInterface>(modelIdentifier.post, PostSchema);
export const progressModel = model<ProgressInterface>(
  modelIdentifier.progress,
  ProgressSchema
);
export type postModelType = Model<PostInterface>;
export type progressModelType = Model<ProgressInterface>;

export const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    dialect: "mysql",
  }
);
