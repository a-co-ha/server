import { ClientSession } from "mongoose";
import { ERROR_NAME, PAGE_TYPE, TEMPLATE_STATUS } from "../constants";
import {
  basicPageOrTemplateInfo,
  createPageOrTemplateInfo,
  ListInterface,
  parentTemplateInfo,
  progressPercentage,
  progressPercentageArray,
  putPageInTemplate,
  template,
  updateTemplateInfo,
} from "../interface";
import {
  listModel,
  listModelType,
  pageModel,
  pageModelType,
  templateModel,
  templateModelType,
} from "../model";
import {
  ListService,
  listService,
  PageService,
  pageService,
} from "../services";

export class TemplateService {
  constructor(
    private templateModel: templateModelType,
    private listModel: listModelType,
    private pageService: PageService,
    private listService: ListService,
    private pageModel: pageModelType
  ) {}
  public async createTemplateProgress(
    createTemplateInfo: createPageOrTemplateInfo
  ): Promise<template> {
    const pageType = PAGE_TYPE.PROGRESSIVE;
    const progressStatus = TEMPLATE_STATUS.TODO;
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
    if (templateType === PAGE_TYPE.TEMPLATE_PROGRESSIVE) {
      if (!progressStatus) {
        throw new Error(ERROR_NAME.NOT_FOUND_PROGRESS_STATUS);
      }

      const pageType = PAGE_TYPE.PROGRESSIVE;

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
    if (progress.type !== PAGE_TYPE.TEMPLATE_PROGRESSIVE) {
      throw new Error(ERROR_NAME.TEMPLATE_TYPE_ERROR);
    }

    const progressPages = progress.pages;
    const length = progressPages.length;
    let count = 0;
    progressPages.map((page) => {
      if (page.progressStatus === TEMPLATE_STATUS.COMPLETE) {
        count++;
      }
    });
    const percentage = Math.floor((count / length) * 100);
    const progressPercentage = {
      percentage,
    };
    return progressPercentage;
  }

  public async channelAllProgressTemplatePercent(
    channelId: number
  ): Promise<progressPercentage[]> {
    const type = PAGE_TYPE.TEMPLATE_PROGRESSIVE;
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
  pageModel
);
