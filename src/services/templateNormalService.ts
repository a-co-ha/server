import {
  pageModel,
  pageModelType,
  templateModel,
  templateModelType,
} from "../model";
import { PageService, pageService } from "./pageService";
import { templateService, TemplateService } from "./templateService";
import { ITemplateNormalModel, template, pageStatusUpdate } from "../interface";
import { ClientSession } from "mongoose";

class TemplateNormalService {
  private templateModel: templateModelType;
  private pageService: PageService;
  private templateService: TemplateService;
  private pageModel: pageModelType;
  constructor(
    templateModel: templateModelType,
    pageService: PageService,
    templateService: TemplateService,
    pageModel: pageModelType
  ) {
    this.templateModel = templateModel;
    this.pageService = pageService;
    this.templateService = templateService;
    this.pageModel = pageModel;
  }

  public async createTemplate(
    channelId: number,
    blockId: string,
    type: string,
    session: ClientSession
  ): Promise<template> {
    const pageType = "normal-page";
    const pages = await this.pageService.createPage(
      channelId,
      blockId,
      session,
      pageType
    );
    const createNormalTemplate = await this.templateModel.create(
      [
        {
          channelId,
          pages,
          type,
        },
      ],
      { session }
    );

    const pageParentTemplate = await this.pageModel
      .findByIdAndUpdate(
        {
          _id: pages._id,
        },
        { parentTemplate: createNormalTemplate[0].id }
      )
      .session(session);
    console.log(pageParentTemplate);

    await this.templateService.createListTemplate(
      channelId,
      createNormalTemplate[0],
      session
    );
    return createNormalTemplate[0];
  }

  public async findTemplate(
    channelId: number,
    id: string,
    session: ClientSession,
    type?: string
  ): Promise<template> {
    const templateNormal = this.templateModel
      .findOne({ _id: id, type })
      .populate({
        path: "pages",
        select: "pageName label type",
      })
      .session(session);
    return await templateNormal.findOne({ channelId });
  }

  public async addTemplatePage(
    channelId: number,
    id: string,
    blockId: string,
    type: string,
    session: ClientSession
  ): Promise<template> {
    const template = await this.findTemplate(channelId, id, session, type);
    let pageType = "";

    const templateType = template.type;
    const parentTemplate = template.id;

    if (templateType === "template-normal") {
      pageType = "normal-page";
      const pages = await this.pageService.createPage(
        channelId,
        blockId,
        session,
        pageType,
        parentTemplate
      );

      return this.templateModel
        .findOneAndUpdate({ _id: id }, { $push: { pages } })
        .session(session)
        .then(() => {
          return this.findTemplate(channelId, id, session, type);
        });
    }
  }

  public async updateTemplateNormal(
    channelId: number,
    id: string,
    pageName: string,
    pages: [pageStatusUpdate],
    type: string,
    session: ClientSession
  ): Promise<template> {
    return await this.templateModel
      .findByIdAndUpdate({ _id: id }, { pageName, pages })
      .session(session)
      .then(() => {
        return this.findTemplate(channelId, id, session, type);
      });
  }
}

export const templateNormalService = new TemplateNormalService(
  templateModel,
  pageService,
  templateService,
  pageModel
);
