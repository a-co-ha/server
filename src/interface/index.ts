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
  deletePage(id: string): Promise<object>;
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
  deleteTemplate(id: string): Promise<object>;
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
