import {
  listModel,
  listModelType,
  pageModel,
  pageModelType,
  templateModel,
  templateModelType,
} from "../model";
import { PageService, pageService } from "./pageService";
import {
  template,
  pageStatusUpdate,
  parentTemplateInfo,
  progressPercentage,
  progressPercentageArray,
  putPageInTemplate,
  updateTemplateInfo,
} from "../interface/templateInterface";

import {
  basicPageOrTemplateInfo,
  block,
  createPageOrTemplateInfo,
} from "../interface/pageInterface";
import { ListService, listService } from "./listService";
import { ListInterface } from "../model/schema/listSchema";
import { mongoTransaction, MongoTransaction } from "../db";
import { ClientSession } from "mongoose";

export class TemplateService {
  private templateModel: templateModelType;
  private listModel: listModelType;
  private pageService: PageService;
  private listService: ListService;
  private mongoTransaction: MongoTransaction;
  private pageModel: pageModelType;
  constructor(
    templateModel: templateModelType,
    listModel: listModelType,
    pageService: PageService,
    listService: ListService,
    mongoTransaction: MongoTransaction,
    pageModel: pageModelType
  ) {
    this.templateModel = templateModel;
    this.listModel = listModel;
    this.pageService = pageService;
    this.listService = listService;
    this.mongoTransaction = mongoTransaction;
    this.pageModel = pageModel;
  }

  public async createTemplateProgress(
    createTemplateInfo: createPageOrTemplateInfo
  ): Promise<template> {
    const pageType = "progress-page";
    const progressStatus = "todo";
    const { channelId, blockId, type, session } = createTemplateInfo;
    const parentTemplateInfo: parentTemplateInfo = {
      pageType,
      progressStatus,
    };
    const createPageInfo: createPageOrTemplateInfo = {
      channelId,
      blockId,
      session,
      parentTemplateInfo,
    };

    const pages = await this.pageService.createPage(createPageInfo);

    const createTemplate = await this.templateModel.create(
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
        { _id: pages._id },
        { parentTemplate: createTemplate[0].id }
      )
      .session(session);

    await this.putTemplateInList(channelId, createTemplate[0], session);
    return createTemplate[0];
  }

  public async putTemplateInList(
    channelId: number,
    template: template,
    session: ClientSession
  ): Promise<ListInterface> {
    const list = await this.listModel.findOne({ channelId });
    const listId = list._id;
    const pushTemplateList = await this.listModel
      .findByIdAndUpdate(
        { _id: listId },
        { $push: { EditablePage: { template } } }
      )
      .session(session);
    return pushTemplateList;
  }

  public async findTemplateProgress(
    templateInfo: basicPageOrTemplateInfo
  ): Promise<template> {
    const { id, channelId, session, type } = templateInfo;
    const findTemplateProgress = await this.templateModel
      .findOne({ _id: id, channelId, type })
      .populate({
        path: "pages",
        select: "pageName label progressStatus type",
      })
      .session(session);
    return findTemplateProgress;
  }

  public async putPageInTemplateProgress(
    putPageInTemplate: putPageInTemplate
  ): Promise<template> {
    const { channelId, id, session, type, blockId, progressStatus } =
      putPageInTemplate;
    const templateInfo: basicPageOrTemplateInfo = {
      channelId,
      id,
      session,
      type,
    };
    const findTemplateProgress = await this.findTemplateProgress(templateInfo);

    const templateType = findTemplateProgress.type;
    if (templateType === "template-progress") {
      if (!progressStatus) {
        throw new Error("progressStatus를 입력하세요");
      }

      const pageType = "progress-page";

      const parentTemplateInfo: parentTemplateInfo = {
        pageType,
        parentTemplate: findTemplateProgress.id,
        progressStatus,
      };

      const createPageInfo: createPageOrTemplateInfo = {
        channelId,
        blockId,
        session,
        parentTemplateInfo,
      };

      const pages = await this.pageService.createPage(createPageInfo);

      return await this.templateModel
        .findByIdAndUpdate({ _id: id }, { $push: { pages } })
        .session(session)
        .then(async () => {
          return await this.findTemplateProgress(templateInfo);
        });
    }
  }

  public async updateTemplateProgress(
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
    if (pages) {
      pages.map((page) => {
        if (page.progressStatus) {
          return this.pageService.pageStatusUpdate(
            page._id,
            page.progressStatus
          );
        }
      });
    }
    return await this.templateModel
      .findByIdAndUpdate({ _id: id, channelId }, { pageName, pages })
      .then(() => {
        return this.findTemplateProgress(templateInfo);
      });
  }

  public async templateInEditablePageDeleteOne(
    editablePageId: string,
    channelId: number,
    type: string,
    session: ClientSession
  ): Promise<any> {
    const findTemplatePage = await this.pageModel
      .findOne({ _id: editablePageId, channelId })
      .populate({
        path: "parentTemplate",
        select: "pageName",
      });

    const templateId = findTemplatePage.parentTemplate.id;
    const templateInfo: basicPageOrTemplateInfo = {
      channelId,
      id: templateId,
      session,
      type,
    };

    return await this.templateModel
      .findByIdAndUpdate(
        { _id: templateId },
        { $pull: { pages: editablePageId } }
      )
      .then(async () => {
        await this.pageModel.deleteOne({
          _id: editablePageId,
          channel: channelId,
        });
        return await this.findTemplateProgress(templateInfo);
      });
  }

  public async deleteTemplate(
    id: string,
    channelId: number,
    session: ClientSession
  ): Promise<object> {
    const deleteTemplate = await this.templateModel
      .deleteOne({ _id: id })
      .session(session);
    await this.listService.deleteListTemplate(channelId, id, session);
    return deleteTemplate;
  }

  async percentageProgress(id: string): Promise<progressPercentage> {
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

  async channelAllProgressTemplatePercent(
    channelId: number
  ): Promise<progressPercentage[]> {
    const type = "template-progress";
    const channelAllProgressTemplate = await this.templateModel.find(
      {
        channelId,
        type,
      },
      {
        id: 1,
        pageName: 1,
      }
    );

    const progressTemplatePercentageArray = channelAllProgressTemplate.map(
      async (i) => {
        const id = i.id;

        const percentage = await this.percentageProgress(id);
        const percentageProgress: progressPercentageArray = {
          _id: id,
          pageName: i.pageName,
          percentage: percentage.percentage,
        };
        return percentageProgress;
      }
    );

    const resultArray = await Promise.all(progressTemplatePercentageArray);

    return resultArray;
  }
}

export const templateService = new TemplateService(
  templateModel,
  listModel,
  pageService,
  listService,
  mongoTransaction,
  pageModel
);
