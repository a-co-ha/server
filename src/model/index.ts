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
import {
  ChatBookmarkSchema,
  ChatBookmarkInterface,
} from "./schema/chatBookmarkSchema";
import {
  BookmarkListInterface,
  bookmarkListSchema,
} from "./schema/bookmarkListSchema";
interface ModelIdentifierInterface {
  page: string;
  template: string;
  list: string;
  socket: string;
  chatBookmark: string;
  bookmarkList: string;
}
export const modelIdentifier: ModelIdentifierInterface = {
  page: "page",
  template: "template",
  list: "list",
  socket: "socket",
  chatBookmark: "chatBookmark",
  bookmarkList: "bookmarkList",
};

export const pageModel = model<PageInterface>(modelIdentifier.page, PageSchema);
export const templateModel = model<TemplateInterface>(
  modelIdentifier.template,
  TemplateSchema
);
export const listModel = model<ListInterface>(modelIdentifier.list, ListSchema);
export const socketModel = model<SocketInterface>(
  modelIdentifier.socket,
  socketSchema
);
export const chatBookmarkModel = model<ChatBookmarkInterface>(
  modelIdentifier.chatBookmark,
  ChatBookmarkSchema
);
export const bookmarkListModel = model<BookmarkListInterface>(
  modelIdentifier.bookmarkList,
  bookmarkListSchema
);

export type pageModelType = Model<PageInterface>;
export type templateModelType = Model<TemplateInterface>;
export type listModelType = Model<ListInterface>;
export type socketModelType = Model<SocketInterface>;
export type chatBookmarkModelType = Model<ChatBookmarkInterface>;
export type bookmarkListModelType = Model<BookmarkListInterface>;

export const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    dialect: "mysql",
    timezone: "+09:00",
  }
);
