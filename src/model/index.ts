import { Model, model } from "mongoose";
import {
  PageSchema,
  TemplateSchema,
  ListSchema,
  socketSchema,
  BookmarkSchema,
} from "./schema";
import {
  BookmarkInterface,
  ListInterface,
  PageInterface,
  SocketInterface,
  TemplateInterface,
} from "../interface";

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
export * from "./message";
export * from "./channel";
export * from "./user";
export * from "./channelUser";
export * from "./announcements";
export * from "./calendar";
