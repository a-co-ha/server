import { templateService, templateNormalService } from "../services";
import { AsyncRequestHandler } from "../constants";

interface ITemplateController {
  createTemplate: AsyncRequestHandler;
  addTemplatePage: AsyncRequestHandler;
  updateTemplate: AsyncRequestHandler;
  deleteTemplate: AsyncRequestHandler;
  percentageProgress: AsyncRequestHandler;
}

export class TemplateController implements ITemplateController {
  createTemplate: AsyncRequestHandler = async (req, res) => {
    const { channel, blockId, type } = req.body;

    if (type === "template-progress") {
      const createTemplate = await templateService.createTemplate(
        channel,
        blockId,
        type
      );
      res.json(createTemplate);
    } else {
      const createTemplate = await templateNormalService.createTemplate(
        channel,
        blockId,
        type
      );
      res.json(createTemplate);
    }
  };

  addTemplatePage: AsyncRequestHandler = async (req, res) => {
    const { id, progressStatus, blockId, channel, type } = req.body;
    if (type === "template-progress") {
      const addTemplatePage = await templateService.addTemplatePage(
        channel,
        id,
        blockId,
        type,
        progressStatus
      );
      res.json(addTemplatePage);
    } else {
      const addTemplatePage = await templateNormalService.addTemplatePage(
        channel,
        id,
        blockId,
        type,
        progressStatus
      );
      res.json(addTemplatePage);
    }
  };

  updateTemplate: AsyncRequestHandler = async (req, res) => {
    const { id, channel, pages, pageName, type } = req.body;

    if (type === "template-progress") {
      const updateProgress = await templateService.updateTemplateProgress(
        channel,
        id,
        pageName,
        pages,
        type
      );
      res.json(updateProgress);
    } else {
      const updateNormalTemplate =
        await templateNormalService.updateTemplateNormal(
          channel,
          id,
          pageName,
          pages,
          type
        );
      res.json(updateNormalTemplate);
    }
  };

  deleteTemplate: AsyncRequestHandler = async (req, res) => {
    const { id, channel } = req.body;
    const deleteProgress = await templateService.deleteTemplate(id, channel);
    res.json(deleteProgress);
  };

  percentageProgress: AsyncRequestHandler = async (req, res) => {
    const { id } = req.body;
    const percentageProgress = await templateService.percentageProgress(id);
    res.json(percentageProgress);
  };
}

export const templateController = new TemplateController();
