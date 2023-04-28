import { templateService, templateNormalService } from "../services";
import { AsyncRequestHandler } from "../utils";
import { mongoTransaction, MongoTransaction } from "../db";
import { ClientSession } from "mongoose";

interface ITemplateController {
  createTemplate: AsyncRequestHandler;
  addTemplatePage: AsyncRequestHandler;
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
    if (type === "template-progress") {
      const createTemplateResult = await this.mongoTransaction.withTransaction(
        async (session: ClientSession) => {
          const createTemplate = await templateService.createTemplate(
            channel,
            blockId,
            type,
            session
          );
          return createTemplate;
        }
      );
      res.json(createTemplateResult);
    } else {
      const createTemplateResult = await this.mongoTransaction.withTransaction(
        async (session: ClientSession) => {
          const createTemplate = await templateNormalService.createTemplate(
            channel,
            blockId,
            type,
            session
          );
          return createTemplate;
        }
      );
      res.json(createTemplateResult);
    }
  };

  addTemplatePage: AsyncRequestHandler = async (req, res) => {
    const { id, progressStatus, blockId, channel, type } = req.body;
    if (type === "template-progress") {
      const addTemplatePageResult = await this.mongoTransaction.withTransaction(
        async (session: ClientSession) => {
          const addTemplatePage = await templateService.addTemplatePage(
            channel,
            id,
            blockId,
            type,
            session,
            progressStatus
          );
          return addTemplatePage;
        }
      );
      res.json(addTemplatePageResult);
    } else {
      const addTemplatePageResult = await this.mongoTransaction.withTransaction(
        async (session: ClientSession) => {
          const addTemplateNormalPage =
            await templateNormalService.addTemplatePage(
              channel,
              id,
              blockId,
              type,
              session
            );
          return addTemplateNormalPage;
        }
      );
      res.json(addTemplatePageResult);
    }
  };

  updateTemplate: AsyncRequestHandler = async (req, res) => {
    const { id, channel, pages, pageName, type } = req.body;

    if (type === "template-progress") {
      const updateProgressResult = await this.mongoTransaction.withTransaction(
        async (session: ClientSession) => {
          const updateProgress = await templateService.updateTemplateProgress(
            channel,
            id,
            pageName,
            pages,
            type,
            session
          );
          return updateProgress;
        }
      );
      res.json(updateProgressResult);
    } else {
      const updateNormalTemplateResult =
        await this.mongoTransaction.withTransaction(
          async (session: ClientSession) => {
            const updateNormalTemplate =
              await templateNormalService.updateTemplateNormal(
                channel,
                id,
                pageName,
                pages,
                type,
                session
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
