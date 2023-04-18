import { ListInterface } from "../model/schema/listSchema";
import { BookmarkListInterface } from "../model/schema/bookmarkListSchema";
export interface block {
  blockId?: string;
  tag: string;
  html?: string;
  imgUrl?: string;
}

export interface label {
  content: string;
}

export interface page {
  channelId?: number;
  pageName?: string;
  _id?: {};
  label?: {};
  blocks: {};
  type?: string;
  categories?: string;
  session?: any;
}

export interface IPageModel {
  findPage(channelId: number, id: string, type?: string): Promise<page>;
  createPage(
    channelId: number,
    blockId: string,
    progressStatus?: string,
    type?: string
  ): Promise<page>;
  pushBlock(id: string, page: page): Promise<page>;
  deletePage(id: string, channelId: number): Promise<object>;
}

export interface pages {
  pageId: {};
  pageName: string;
  label: {};
  status?: string;
}
export interface template {
  channelId: number;
  pageName?: string;
  pages: {};
  type?: string;
}
export interface pageStatusUpdate {
  _id: string;
  progressStatus?: string;
}

export interface list {
  channelId: number;
  EditablePage: page[];
}

export interface ITemplateModel {
  createTemplate(
    channelId: number,
    blockId: string,
    type: string
  ): Promise<template>;
  findTemplate(channelId: number, id: string, type?: string): Promise<template>;
  addTemplatePage(
    channelId: number,
    id: string,
    blockId: string,
    type: string,
    progressStatus?: string
  ): Promise<template>;
  updateTemplateProgress(
    channelId: number,
    id: string,
    pageName: string,
    pages: pageStatusUpdate[],
    type: string
  ): Promise<template>;
  deleteTemplate(id: string, channelId: number): Promise<object>;
  percentageProgress(id: string): Promise<object>;
}
export interface ITemplateNormalModel {
  createTemplate(
    channelId: number,
    blockId: string,
    type: string
  ): Promise<template>;
  findTemplate(channelId: number, id: string, type?: string): Promise<template>;
  addTemplatePage(
    channelId: number,
    id: string,
    blockId: string,
    type: string,
    progressStatus?: string
  ): Promise<template>;
  updateTemplateNormal(
    channelId: number,
    id: string,
    pageName: string,
    pages: [pageStatusUpdate],
    type: string
  ): Promise<template>;
}

export interface IListModel {
  createList(channelId: number): Promise<ListInterface>;
  createListPage(channelId: number, page: page): Promise<ListInterface>;
  createListTemplate(
    channelId: number,
    template: template
  ): Promise<ListInterface>;
  findList(channelId: number): Promise<ListInterface>;
  updateList(channelId: number, listPage: list): Promise<ListInterface>;
  deleteListPage(channelId: number, id: string): Promise<ListInterface>;
}
export interface bookmarkInfo {
  channelId: number;
  bookmarkName: string;
  content: string;
  userId: number;
  userName: string;
}
export interface IChatBookmarkModel {
  createBookmark(bookmarkInfo: bookmarkInfo): Promise<bookmarkInfo>;
  findBookmark(id: string, channelId: number): Promise<bookmarkInfo>;
  updateBookmark(id: string, bookmarkInfo: bookmarkInfo): Promise<bookmarkInfo>;
  deleteBookmark(id: string, channelId: number): Promise<any>;
}

export interface IBookmarkListModel {
  // createBookmark(
  //   channelId: number,
  //   bookmark: bookmarkInfo
  // ): Promise<BookmarkListInterface>;
  findBookmarkList(channelId: number): Promise<BookmarkListInterface>;
  updateBookmarkList(
    channelId: number,
    bookmark: bookmarkInfo[]
  ): Promise<BookmarkListInterface>;
}

export interface MessageAttributes {
  id?: string;
  name: string;
  img?: string;
  text?: string;
  roomId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export * from "./channelInterface";
export * from "./userInterface";
