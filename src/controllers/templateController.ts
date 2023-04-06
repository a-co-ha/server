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
    const channel = req.query.channel as string;
    const type = req.query.type as string;
    const channelId = parseInt(channel);
    const blockId = req.body.blockId;
    console.log(type);
    if (type === "template-progress") {
      const createTemplate = await templateService.createTemplate(
        channelId,
        blockId,
        type
      );
      res.json(createTemplate);
    } else {
      const createTemplate = await templateNormalService.createTemplate(
        channelId,
        blockId,
        type
      );
      res.json(createTemplate);
    }
  };

  addTemplatePage: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const id = req.params.id;
    const type = req.query.type as string;
    console.log(type);
    const { progressStatus, blockId } = req.body;
    if (type === "template-progress") {
      const addTemplatePage = await templateService.addTemplatePage(
        channelId,
        id,
        blockId,
        type,
        progressStatus
      );
      res.json(addTemplatePage);
    } else {
      const addTemplatePage = await templateNormalService.addTemplatePage(
        channelId,
        id,
        blockId,
        type,
        progressStatus
      );
      res.json(addTemplatePage);
    }
  };

  updateTemplate: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const id = req.params.id;
    const type = req.query.type as string;
    const { pages, pageName } = req.body;

    if (type === "template-progress") {
      const updateProgress = await templateService.updateTemplateProgress(
        channelId,
        id,
        pageName,
        pages,
        type
      );
      res.json(updateProgress);
    } else {
      const updateNormalTemplate =
        await templateNormalService.updateTemplateNormal(
          channelId,
          id,
          pageName,
          pages,
          type
        );
      res.json(updateNormalTemplate);
    }
  };

  deleteTemplate: AsyncRequestHandler = async (req, res) => {
    const id = req.params.id;
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const deleteProgress = await templateService.deleteTemplate(id, channelId);
    res.json(deleteProgress);
  };

  percentageProgress: AsyncRequestHandler = async (req, res) => {
    const id = req.params.id;
    const percentageProgress = await templateService.percentageProgress(id);
    res.json(percentageProgress);
  };
}

export const templateController = new TemplateController();
