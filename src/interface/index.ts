import { ListInterface } from "../model/schema/listSchema";
export interface block {
  blockId?: string;
  tag: string;
  html?: string;
  imgUrl?: string;
}

export interface page {
  channelId?: number;
  pageName?: string;
  _id?: {};
  label?: {};
  blocks: {};
  type?: string;
  categories?: string;
}

export interface IPageModel {
  findPage(channelId: number, id: string, type?: string): Promise<page>;
  createPage(
    channelId: number,
    blockId: string,
    progressStatus?: string,
    type?: string
  ): Promise<page>;
  pushPage(id: string, page: page): Promise<page>;
  deletePage(id: string, channelId?: number): Promise<object>;
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
  ListPage: page[];
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
    pages: [pageStatusUpdate],
    type: string
  ): Promise<template>;
  deleteTemplate(id: string, channelId?: number): Promise<object>;
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

<<<<<<< HEAD
=======
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

export interface UserAttributes {
  id?: number;
  name: string;
  githubID: string;
  githubURL: string;
  img: string;
}
export interface Channel_UserAttributes {
  userId: string;
  channelId: number;
}
>>>>>>> 7d9b17da6a55be9487fcfcfd35457bb8eb0430b3
export interface MessageAttributes {
  id?: string;
  name: string;
  githubID: string;
  img?: string;
  text?: string;
  channelId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export * from "./channelInterface";
export * from "./userInterface";
