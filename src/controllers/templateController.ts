import { PAGE_TYPE } from "./../constants";
import { templateService, templateNormalService } from "../services";
import { AsyncRequestHandler } from "../utils";
import { mongoTransaction, MongoTransaction } from "../db";
import { ClientSession } from "mongoose";
import {
  createPageOrTemplateInfo,
  ITemplateController,
  putPageInTemplate,
  updateTemplateInfo,
} from "../interface";

export class TemplateController implements ITemplateController {
  constructor(private mongoTransaction: MongoTransaction) {}

  createTemplate: AsyncRequestHandler = async (req, res) => {
    const { channel, blockId, type } = req.body;
    const createTemplateProgressResult =
      await this.mongoTransaction.withTransaction(
        async (session: ClientSession) => {
          const createTemplateProgressInfo: createPageOrTemplateInfo = {
            channelId: channel,
            blockId,
            type,
            session,
          };
          const createTemplateProgress = await templateService.createTemplate(
            createTemplateProgressInfo
          );
          return createTemplateProgress;
        }
      );
    res.json(createTemplateProgressResult);
  };

  putPageInTemplate: AsyncRequestHandler = async (req, res) => {
    const { id, progressStatus, blockId, channel, type } = req.body;
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

        const addTemplatePage = await templateService.putPageInTemplateProgress(
          putPageInTemplate
        );
        return addTemplatePage;
      }
    );
    res.json(addTemplatePageResult);
  };

  updateTemplate: AsyncRequestHandler = async (req, res) => {
    const { id, channel, pages, pageName, type } = req.body;

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
