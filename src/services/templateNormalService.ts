import {
  pageModel,
  pageModelType,
  templateModel,
  templateModelType,
} from "../model";
import { PageService, pageService } from "./pageService";
import { templateService, TemplateService } from "./templateService";
import {
  template,
  pageStatusUpdate,
  parentTemplateInfo,
  putPageInTemplate,
  updateTemplateInfo,
} from "../interface/templateInterface";
import { ClientSession } from "mongoose";
import {
  basicPageOrTemplateInfo,
  createPageOrTemplateInfo,
} from "../interface/pageInterface";

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

  public async createTemplateNormal(
    createTemplateNormalInfo: createPageOrTemplateInfo
    // channelId: number,
    // blockId: string,
    // type: string,
    // session: ClientSession
  ): Promise<template> {
    const { channelId, blockId, type, session } = createTemplateNormalInfo;

    const pageType = "normal-page";
    const parentTemplateInfo: parentTemplateInfo = {
      pageType,
    };
    const createPageInfo: createPageOrTemplateInfo = {
      channelId,
      blockId,
      session,
      parentTemplateInfo,
    };

    const pages = await this.pageService.createPage(createPageInfo);
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

    await this.pageModel
      .findByIdAndUpdate(
        {
          _id: pages._id,
        },
        { parentTemplate: createNormalTemplate[0].id }
      )
      .session(session);

    await this.templateService.putTemplateInList(
      channelId,
      createNormalTemplate[0],
      session
    );
    return createNormalTemplate[0];
  }

  public async findTemplateNormal(
    templateInfo: basicPageOrTemplateInfo
  ): Promise<template> {
    const { channelId, id, session, type } = templateInfo;

    const findTemplateNormal = this.templateModel
      .findOne({ _id: id, channelId, type })
      .populate({
        path: "pages",
        select: "pageName label type",
      })
      .session(session);
    return findTemplateNormal;
  }

  public async putPageInTemplateNormal(
    putPageInTemplate: putPageInTemplate
  ): Promise<template> {
    const { channelId, id, session, type, blockId } = putPageInTemplate;
    const templateInfo: basicPageOrTemplateInfo = {
      channelId,
      id,
      session,
      type,
    };
    const findTemplateNormal = await this.findTemplateNormal(templateInfo);
    const pageType = "normal-page";
    const templateType = findTemplateNormal.type;

    if (templateType === "template-normal") {
      const parentTemplateInfo: parentTemplateInfo = {
        pageType,
        parentTemplate: findTemplateNormal.id,
      };
      const createPageInfo: createPageOrTemplateInfo = {
        channelId,
        blockId,
        session,
        parentTemplateInfo,
      };
      const pages = await this.pageService.createPage(createPageInfo);

      return this.templateModel
        .findOneAndUpdate({ _id: id }, { $push: { pages } })
        .session(session)
        .then(() => {
          return this.findTemplateNormal(templateInfo);
        });
    }
  }

  public async updateTemplateNormal(
    updateTemplateInfo: updateTemplateInfo
  ): Promise<template> {
    const { channelId, id, pageName, pages, type, session } =
      updateTemplateInfo;
    const templateInfo: basicPageOrTemplateInfo = {
      channelId,
      id,
      session,
      type,
    };
    return await this.templateModel
      .findByIdAndUpdate({ _id: id }, { pageName, pages })
      .session(session)
      .then(() => {
        return this.findTemplateNormal(templateInfo);
      });
  }
}

export const templateNormalService = new TemplateNormalService(
  templateModel,
  pageService,
  templateService,
  pageModel
);
