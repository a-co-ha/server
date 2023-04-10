import {
  listModel,
  listModelType,
  pageModel,
  templateModel,
  templateModelType,
} from "../model";
import { PageService, pageService } from "./pageService";
import { ITemplateModel, template, pageStatusUpdate } from "../interface";
import { ListService, listService } from "./listService";
import { ListInterface } from "../model/schema/listSchema";

class TemplateService {
  private templateModel: templateModelType;
  private listModel: listModelType;
  private pageService: PageService;
  private listService: ListService;
  constructor(
    templateModel: templateModelType,
    listModel: listModelType,
    pageService: PageService,
    listService: ListService
  ) {
    this.templateModel = templateModel;
    this.listModel = listModel;
    this.pageService = pageService;
    this.listService = listService;
  }

  public async createTemplate(
    channelId: number,
    blockId: string,
    type: string
  ): Promise<template> {
    const pageType = "progress-page";
    const progressStatus = "todo";

    const pages = await this.pageService.createPage(
      channelId,
      blockId,
      pageType,
      progressStatus
    );
    const template = await this.templateModel.create({
      channelId,
      pages,
      type,
    });
    await this.createListTemplate(channelId, template);

    return template;
  }
  public async createListTemplate(
    channelId: number,
    template: template
  ): Promise<ListInterface> {
    const list = await this.listModel.findOne({ channelId });
    const listId = list._id;
    const pushTemplateList = await this.listModel.findByIdAndUpdate(
      { _id: listId },
      { $push: { EditablePage: { template } } }
    );

    return pushTemplateList;
  }
  public async findTemplate(
    channelId: number,
    id: string,
    type?: string
  ): Promise<template> {
    const progress = this.templateModel.findOne({ _id: id, type }).populate({
      path: "pages",
      select: "pageName label progressStatus type",
    });
    return await progress.findOne({ channelId });
  }

  public async addTemplatePage(
    channelId: number,
    id: string,
    blockId: string,
    type: string,
    progressStatus?: string
  ): Promise<template> {
    const template = await this.findTemplate(channelId, id, type);
    let pageType = "";
    const templateType = template.type;
    if (templateType === "template-progress") {
      if (!progressStatus) {
        throw new Error("progressStatus를 입력하세요");
      }
      pageType = "progress-page";
      const pages = await this.pageService.createPage(
        channelId,
        blockId,
        pageType,
        progressStatus
      );
      return this.templateModel
        .findByIdAndUpdate({ _id: id }, { $push: { pages } })
        .then(() => {
          return this.findTemplate(channelId, id, type);
        });
    }
  }

  public async updateTemplateProgress(
    channelId: number,
    id: string,
    pageName: string,
    pages: pageStatusUpdate[],
    type: string
  ): Promise<template> {
    pages.map((page) => {
      if (page.progressStatus) {
        return this.pageService.pageStatusUpdate(page._id, page.progressStatus);
      }
    });
    return await this.templateModel
      .findByIdAndUpdate({ _id: id, channelId }, { pageName, pages })
      .then(() => {
        return this.findTemplate(channelId, id, type);
      });
  }

  public async deleteTemplate(id: string, channelId: number): Promise<object> {
    const deleteTemplate = await this.templateModel.deleteOne({ _id: id });
    await this.listService.deleteListTemplate(channelId, id);
    return deleteTemplate;
  }

  async percentageProgress(id: string): Promise<object> {
    const progress = await templateModel.findOne({ _id: id }).populate({
      path: "pages",
      select: "progressStatus",
    });
    if (progress.type !== "template-progress") {
      throw new Error("진행현황 템플릿이 아닙니다.");
    }

    const progressPages = progress.pages;
    const length = progressPages.length;
    let count = 0;
    progressPages.map((page) => {
      if (page.progressStatus === "complete") {
        count++;
      }
    });
    const percentage = Math.floor((count / length) * 100);
    const progressPercentage = {
      percentage,
    };
    return progressPercentage;
  }
}

export const templateService = new TemplateService(
  templateModel,
  listModel,
  pageService,
  listService
);
