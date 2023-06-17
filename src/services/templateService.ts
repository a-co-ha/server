import { ObjectId } from "mongodb";
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
  TemplateNormalService,
  templateNormalService,
} from "../services";
export class TemplateService {
  constructor(
    private templateModel: templateModelType,
    private listModel: listModelType,
    private pageService: PageService,
    private listService: ListService,
    private pageModel: pageModelType,
    private templateNormalService: TemplateNormalService
  ) {}

  private templateProgressChceck(type: string): boolean {
    return type === PAGE_TYPE.TEMPLATE_PROGRESSIVE;
  }

  private templateNormalChceck(type: string): boolean {
    return type === PAGE_TYPE.TEMPLATE_NORMAL;
  }

  public async createTemplate(
    createTemplateInfo: createPageOrTemplateInfo
  ): Promise<template> {
    const { channelId, blockId, type, session } = createTemplateInfo;
    if (this.templateProgressChceck(type)) {
      const pageType = PAGE_TYPE.PROGRESSIVE;
      const progressStatus = TEMPLATE_STATUS.TODO;
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

      await this.listService.putTemplateInList(
        channelId,
        createTemplate[0],
        session
      );
      return createTemplate[0];
    }

    if (this.templateNormalChceck) {
      return this.templateNormalService.createTemplateNormal(
        createTemplateInfo
      );
    }
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
    if (this.templateProgressChceck) {
      const templateInfo: basicPageOrTemplateInfo = {
        channelId,
        id,
        session,
        type,
      };
      const findTemplateProgress = await this.findTemplateProgress(
        templateInfo
      );

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
    if (this.templateNormalChceck) {
      return await this.templateNormalService.putPageInTemplateNormal(
        putPageInTemplate
      );
    }
  }

  public async updateTemplateProgress(
    updateTemplateInfo: updateTemplateInfo
  ): Promise<template> {
    if (this.templateProgressChceck) {
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
    if (this.templateNormalChceck) {
      return this.templateNormalService.updateTemplateNormal(
        updateTemplateInfo
      );
    }
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

  public findTemplateName = async (id: string) => {
    try {
      return await this.templateModel.findById(
        {
          _id: new ObjectId(id),
        },
        { pageName: 1 }
      );
    } catch (err) {
      throw new Error("페이지를 찾을 수 없습니다.");
    }
  };
}

export const templateService = new TemplateService(
  templateModel,
  listModel,
  pageService,
  listService,
  pageModel,
  templateNormalService
);
