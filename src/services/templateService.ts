import { pageModel, templateModel, templateModelType } from "../model";
import { pageService } from "./pageService";
import { ITemplateModel, template, pageStatusUpdate } from "../interface";
import { listService } from "./listService";

class TemplateService implements ITemplateModel {
  private templateModel: templateModelType;
  constructor(templateModel: templateModelType) {
    this.templateModel = templateModel;
  }

  async createTemplate(
    channelId: number,
    blockId: string,
    type: string
  ): Promise<template> {
    const pageType = "progress-page";
    const progressStatus = "todo";
    const pages = await pageService.createPage(
      channelId,
      blockId,
      pageType,
      progressStatus
    );
    const template = await templateModel.create({ channelId, pages, type });
    await listService.createListTemplate(channelId, template);

    return template;
  }

  async findTemplate(
    channelId: number,
    id: string,
    type?: string
  ): Promise<template> {
    const progress = templateModel.findOne({ _id: id, type }).populate({
      path: "pages",
      select: "pageName label progressStatus type",
    });
    return await progress.findOne({ channelId });
  }

  async addTemplatePage(
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
      const pages = await pageService.createPage(
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

  async updateTemplateProgress(
    channelId: number,
    id: string,
    pageName: string,
    pages: [pageStatusUpdate],
    type: string
  ): Promise<template> {
    pages.map((page) => {
      if (page.progressStatus) {
        return pageService.pageStatusUpdate(page._id, page.progressStatus);
      }
    });
    return await this.templateModel
      .findByIdAndUpdate({ _id: id, channelId }, { pageName, pages })
      .then(() => {
        return this.findTemplate(channelId, id, type);
      });
  }

  async deleteTemplate(id: string, channelId: number): Promise<object> {
    const deleteTemplate = await templateModel.deleteOne({ _id: id });
    await listService.deleteListTemplate(channelId, id);
    return deleteTemplate;
  }

  async percentageProgress(id: string): Promise<object> {
    const progress = templateModel.findOne({ _id: id }).populate({
      path: "pages",
      select: "progressStatus",
    });

    const progressPages = (await progress).pages;
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

export const templateService = new TemplateService(templateModel);
