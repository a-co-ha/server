import { progressService } from "../services";
import { AsyncRequestHandler } from "../types";

interface IProgressController {
  createProgress: AsyncRequestHandler;
  findProgress: AsyncRequestHandler;
  addProgress: AsyncRequestHandler;
  updateProgress: AsyncRequestHandler;
  deleteProgress: AsyncRequestHandler;
}

export class ProgressController implements IProgressController {
  createProgress: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const blockId = req.body.blockId;
    const createProgress = await progressService.createProgress(
      channelId,
      blockId
    );
    res.json(createProgress);
  };

  findProgress: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const id = req.params.id;
    const channelId = parseInt(channel);
    const findProgress = await progressService.findProgress(channelId, id);
    res.json(findProgress);
  };

  addProgress: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const id = req.params.id;
    const { progressStatus, blockId } = req.body;

    const addProgress = await progressService.addProgress(
      channelId,
      id,
      blockId,
      progressStatus
    );
    res.json(addProgress);
  };

  updateProgress: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const id = req.params.id;
    const pages = req.body.pages;

    const updateProgress = await progressService.updateProgress(
      channelId,
      id,
      pages
    );
    res.json(updateProgress);
  };
  deleteProgress: AsyncRequestHandler = async (req, res) => {
    const id = req.params.id;
    const deleteProgress = await progressService.deleteProgress(id);
    res.json(deleteProgress);
  };
}

export const progressController = new ProgressController();
