import { socket } from "./../routers/socket";
import { Model, model } from "mongoose";
import { Sequelize } from "sequelize";
import { config } from "../config";
import { PageInterface, PageSchema } from "./schema/pageSchema";
import { TemplateInterface, TemplateSchema } from "./schema/templateSchema";
import {
  ListSchema,
  ListInterface,
  SocketInterface,
  socketSchema,
} from "./schema/listSchema";
interface ModelIdentifierInterface {
  page: string;
  template: string;
  list: string;
}
export const modelIdentifier: ModelIdentifierInterface = {
  page: "page",
  template: "template",
  list: "list",
};

export const pageModel = model<PageInterface>(modelIdentifier.page, PageSchema);
export const templateModel = model<TemplateInterface>(
  modelIdentifier.template,
  TemplateSchema
);
export const listModel = model<ListInterface>(modelIdentifier.list, ListSchema);
export const socketModel = model<SocketInterface>("room", socketSchema);

export type pageModelType = Model<PageInterface>;
export type templateModelType = Model<TemplateInterface>;
export type listModelType = Model<ListInterface>;
export type socketModelType = Model<SocketInterface>;
export const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    dialect: "mysql",
  }
);
