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
  ITemplateModel,
  template,
  pageStatusUpdate,
  block,
} from "../interface";
import { ListService, listService } from "./listService";
import { ListInterface } from "../model/schema/listSchema";
import { mongoTransaction, MongoTransaction } from "../db";
import { ClientSession } from "mongoose";

class TemplateService {
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

  public async createTemplate(
    channelId: number,
    blockId: string,
    type: string,
    session: ClientSession
  ): Promise<template> {
    // const session = await this.mongoTransaction.startTransaction();
    // const blocks: block = {
    //   blockId: blockId,
    //   tag: "p",
    //   html: "",
    //   imgUrl: "",
    // };
    const pageType = "progress-page";
    const progressStatus = "todo";
    // try{
    //   const pages = await this.pageModel.create(
    //     [
    //       {
    //         channelId,
    //         blocks,
    //         pageType,
    //         progressStatus,
    //       },
    //     ],
    //     { session }
    //   );

    const pages = await this.pageService.createPage(
      channelId,
      blockId,
      session,
      pageType,
      progressStatus
    );

    const template = await this.templateModel.create(
      [
        {
          channelId,
          pages,
          type,
        },
      ],
      { session }
    );
    await this.createListTemplate(channelId, template[0]);
    // await this.mongoTransaction.commitTransaction(session);
    return template[0];
    // }catch (error) {
    //   throw error;
    // } finally {
    //   session.endSession();
    // }
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
    session: ClientSession,
    type?: string
  ): Promise<template> {
    const progress = await this.templateModel
      .findOne({ _id: id, channelId })
      .populate({
        path: "pages",
        select: "pageName label progressStatus type",
      })
      .session(session);
    return progress;
  }

  public async addTemplatePage(
    channelId: number,
    id: string,
    blockId: string,
    type: string,
    session: ClientSession,
    progressStatus?: string
  ): Promise<template> {
    const template = await this.findTemplate(channelId, id, session);
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
        session,
        pageType,
        progressStatus
      );

      return await this.templateModel
        .findByIdAndUpdate({ _id: id }, { $push: { pages } })
        .session(session)
        .then(async () => {
          return await this.findTemplate(channelId, id, session);
        });
    }
  }

  public async updateTemplateProgress(
    channelId: number,
    id: string,
    pageName: string,
    pages: pageStatusUpdate[],
    type: string,
    session: ClientSession
  ): Promise<template> {
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
        return this.findTemplate(channelId, id, session, type);
      });
  }

  public async templateInEditablePageDeleteOne(
    templateId: string,
    editablePageId: string,
    channelId: number,
    type: string,
    session: ClientSession
  ): Promise<any> {
    return await this.templateModel
      .findByIdAndUpdate(
        { _id: templateId },
        { $pull: { pages: editablePageId } }
      )
      .then(async () => {
        this.pageModel.deleteOne({ _id: editablePageId, channel: channelId });
        return this.findTemplate(channelId, templateId, session);
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
  listService,
  mongoTransaction,
  pageModel
);
