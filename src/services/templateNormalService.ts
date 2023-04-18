import { pageModel, templateModel, templateModelType } from "../model";
import { PageService, pageService } from "./pageService";
import { ITemplateNormalModel, template, pageStatusUpdate } from "../interface";

class TemplateNormalService implements ITemplateNormalModel {
  private templateModel: templateModelType;
  private pageService:PageService
  constructor(
     templateModel: templateModelType,
     pageService:PageService
     ) {
    this.templateModel = templateModel;
    this.pageService=pageService
  }

  public async createTemplate(
    channelId: number,
    blockId: string,
    type?: string
  ): Promise<template> {
    const pageType = "normal-page";
    const pages = await this.pageService.createPage(channelId, blockId, pageType);
    return await this.templateModel.create({ channelId, pages, type });
  }

  public async findTemplate(
    channelId: number,
    id: string,
    type?: string
  ): Promise<template> {
    const templateNormal = this.templateModel.findOne({ _id: id, type }).populate({
      path: "pages",
      select: "pageName label type",
    });
    return await templateNormal.findOne({ channelId });
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
    if (templateType === "template-normal") {
      if (progressStatus) {
        throw new Error();
      }

      pageType = "normal-page";
      progressStatus = "null";
      const pages = await this.pageService.createPage(channelId, blockId, pageType);

      return this.templateModel
        .findOneAndUpdate({ _id: id }, { $push: { pages } })
        .then(() => {
          return this.findTemplate(channelId, id, type);
        });
    }
  }

  public async updateTemplateNormal(
    channelId: number,
    id: string,
    pageName: string,
    pages: [pageStatusUpdate],
    type: string
  ): Promise<template> {
    return await this.templateModel
      .findByIdAndUpdate({ _id: id }, { pageName, pages })
      .then(() => {
        return this.findTemplate(channelId, id, type);
      });
  }
}

export const templateNormalService = new TemplateNormalService(templateModel,pageService);
