import { ListService, listService } from "./listService";
import { PageService, pageService } from "./pageService";
import { templateService, TemplateService } from "./templateService";
import {
  pageModel,
  pageModelType,
  templateModel,
  templateModelType,
} from "../model";
import {
  template,
  parentTemplateInfo,
  putPageInTemplate,
  updateTemplateInfo,
  basicPageOrTemplateInfo,
  createPageOrTemplateInfo,
} from "../interface";
import { PAGE_TYPE } from "../constants";

export class TemplateNormalService {
  private templateModel: templateModelType;
  private pageService: PageService;
  private pageModel: pageModelType;
  private listService: ListService;
  constructor(
    templateModel: templateModelType,
    pageService: PageService,
    pageModel: pageModelType,
    listService: ListService
  ) {
    this.templateModel = templateModel;
    this.pageService = pageService;
    this.pageModel = pageModel;
    this.listService = listService;
  }

  public async createTemplateNormal(
    createTemplateInfo: createPageOrTemplateInfo
  ): Promise<template> {
    const { channelId, blockId, type, session } = createTemplateInfo;

    const pageType = PAGE_TYPE.NORMALIZE;
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

    await this.listService.putTemplateInList(
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
    const pageType = PAGE_TYPE.NORMALIZE;
    const templateType = findTemplateNormal.type;

    if (templateType === PAGE_TYPE.TEMPLATE_NORMAL) {
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
  pageModel,
  listService
);
