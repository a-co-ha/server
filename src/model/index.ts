import { Model, model } from "mongoose";
import { PageInterface, PageSchema } from "./schema/pageSchema";
import { TemplateInterface, TemplateSchema } from "./schema/templateSchema";
import {
  ListSchema,
  ListInterface,
  SocketInterface,
  socketSchema,
} from "./schema/listSchema";
import { BookmarkSchema } from "./schema/bookmarkSchema";
import { BookmarkInterface } from "../interface/bookmarkInterface";

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
export const chatBookmarkModel = model<BookmarkInterface>(
  modelIdentifier.chatBookmark,
  BookmarkSchema
);

export type pageModelType = Model<PageInterface>;
export type templateModelType = Model<TemplateInterface>;
export type listModelType = Model<ListInterface>;
export type socketModelType = Model<SocketInterface>;
export type chatBookmarkModelType = Model<BookmarkInterface>;
