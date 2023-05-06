import { PageType } from "./../constants";
import { templateService, templateNormalService } from "../services";
import { AsyncRequestHandler } from "../utils";
import { mongoTransaction, MongoTransaction } from "../db";
import { ClientSession } from "mongoose";
import {
  createPageOrTemplateInfo,
  putPageInTemplate,
  updateTemplateInfo,
} from "../interface";

interface ITemplateController {
  createTemplate: AsyncRequestHandler;
  putPageInTemplate: AsyncRequestHandler;
  updateTemplate: AsyncRequestHandler;
  deleteTemplate: AsyncRequestHandler;
  percentageProgress: AsyncRequestHandler;
  channelAllProgressTemplatePercent: AsyncRequestHandler;
}

export class TemplateController implements ITemplateController {
  constructor(private mongoTransaction: MongoTransaction) {
    this.mongoTransaction = mongoTransaction;
  }

  createTemplate: AsyncRequestHandler = async (req, res) => {
    const { channel, blockId, type } = req.body;
    if (type === PageType.TEMPLATE_PROGRESSIVE) {
      const createTemplateProgressResult =
        await this.mongoTransaction.withTransaction(
          async (session: ClientSession) => {
            const createTemplateProgressInfo: createPageOrTemplateInfo = {
              channelId: channel,
              blockId,
              type,
              session,
            };
            const createTemplateProgress =
              await templateService.createTemplateProgress(
                createTemplateProgressInfo
              );
            return createTemplateProgress;
          }
        );
      res.json(createTemplateProgressResult);
    } else {
      const createTemplateNormalResult =
        await this.mongoTransaction.withTransaction(
          async (session: ClientSession) => {
            const createTemplateNormalInfo: createPageOrTemplateInfo = {
              channelId: channel,
              blockId,
              type,
              session,
            };
            const createTemplateNormal =
              await templateNormalService.createTemplateNormal(
                createTemplateNormalInfo
              );
            return createTemplateNormal;
          }
        );
      res.json(createTemplateNormalResult);
    }
  };

  putPageInTemplate: AsyncRequestHandler = async (req, res) => {
    const { id, progressStatus, blockId, channel, type } = req.body;
    if (type === PageType.TEMPLATE_PROGRESSIVE) {
      const addTemplatePageResult = await this.mongoTransaction.withTransaction(
        async (session: ClientSession) => {
          const putPageInTemplate: putPageInTemplate = {
            channelId: channel,
            id,
            blockId,
            type,
            session,
            progressStatus,
          };

          const addTemplatePage =
            await templateService.putPageInTemplateProgress(putPageInTemplate);
          return addTemplatePage;
        }
      );
      res.json(addTemplatePageResult);
    } else {
      const addTemplatePageResult = await this.mongoTransaction.withTransaction(
        async (session: ClientSession) => {
          const putPageInTemplate: putPageInTemplate = {
            channelId: channel,
            id,
            blockId,
            type,
            session,
          };
          const addTemplateNormalPage =
            await templateNormalService.putPageInTemplateNormal(
              putPageInTemplate
            );
          return addTemplateNormalPage;
        }
      );
      res.json(addTemplatePageResult);
    }
  };

  updateTemplate: AsyncRequestHandler = async (req, res) => {
    const { id, channel, pages, pageName, type } = req.body;

    if (type === PageType.TEMPLATE_PROGRESSIVE) {
      const updateProgressResult = await this.mongoTransaction.withTransaction(
        async (session: ClientSession) => {
          const updateTemplateInfo: updateTemplateInfo = {
            channelId: channel,
            id,
            pageName,
            pages,
            type,
            session,
          };
          const updateProgress = await templateService.updateTemplateProgress(
            updateTemplateInfo
          );
          return updateProgress;
        }
      );
      res.json(updateProgressResult);
    } else {
      const updateNormalTemplateResult =
        await this.mongoTransaction.withTransaction(
          async (session: ClientSession) => {
            const updateTemplateInfo: updateTemplateInfo = {
              channelId: channel,
              id,
              pageName,
              pages,
              type,
              session,
            };
            const updateNormalTemplate =
              await templateNormalService.updateTemplateNormal(
                updateTemplateInfo
              );
            return updateNormalTemplate;
          }
        );
      res.json(updateNormalTemplateResult);
    }
  };

  deleteTemplate: AsyncRequestHandler = async (req, res) => {
    const { id, channel } = req.body;
    const deleteTemplateResult = await this.mongoTransaction.withTransaction(
      async (session: ClientSession) => {
        const deleteTemplate = await templateService.deleteTemplate(
          id,
          channel,
          session
        );
        return deleteTemplate;
      }
    );
    res.json(deleteTemplateResult);
  };

  percentageProgress: AsyncRequestHandler = async (req, res) => {
    const { id } = req.body;
    const percentageProgress = await templateService.percentageProgress(id);
    res.json(percentageProgress);
  };

  channelAllProgressTemplatePercent: AsyncRequestHandler = async (req, res) => {
    const { channel } = req.body;

    const channelAllProgressTemplatePercent =
      await templateService.channelAllProgressTemplatePercent(channel);
    res.json(channelAllProgressTemplatePercent);
  };
}

export const templateController = new TemplateController(mongoTransaction);
