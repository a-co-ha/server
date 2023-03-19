import { Model, model } from "mongoose";
import { Sequelize } from "sequelize";
import { config } from "../config";
import { PageInterface, PageSchema } from "./schema/pageSchema";
import { TemplateInterface, TemplateSchema } from "./schema/templateSchema";

interface ModelIdentifierInterface {
  page: string;
  template: string;
}
export const modelIdentifier: ModelIdentifierInterface = {
  page: "page",
  template: "template",
};

export const pageModel = model<PageInterface>(modelIdentifier.page, PageSchema);
export const templateModel = model<TemplateInterface>(
  modelIdentifier.template,
  TemplateSchema
);
export type pageModelType = Model<PageInterface>;
export type templateModelType = Model<TemplateInterface>;

export const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    dialect: "mysql",
  }
);
