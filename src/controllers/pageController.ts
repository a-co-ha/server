import { pageService, templateService } from "../services";
import { block, page } from "../interface";
import { AsyncRequestHandler } from "../types";
import { deleteImage } from "../middlewares";

interface IPageController {
  createPage: AsyncRequestHandler;
  pushPage: AsyncRequestHandler;
  findPage: AsyncRequestHandler;
  deletePage: AsyncRequestHandler;
  imageDelete: AsyncRequestHandler;
  imageUpload: AsyncRequestHandler;
}

export class PageController implements IPageController {
  findPage: AsyncRequestHandler = async (req, res) => {
    const id = req.params.id;
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const type = req.query.type;
    if (
      type === "normal" ||
      type === "progress-page" ||
      type === "normal-page"
    ) {
      const findPost = await pageService.findPage(channelId, id, type);
      res.json(findPost);
    }
    if (type === "template-progress" || type === "template-normal") {
      const findProgress = await templateService.findTemplate(
        channelId,
        id,
        type
      );
      res.json(findProgress);
    }
  };

  createPage: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const blockId = req.body.blockId;
    const createPage = await pageService.createPage(channelId, blockId);
    res.json(createPage);
  };

  pushPage: AsyncRequestHandler = async (req, res) => {
    const id = req.params.id;
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const { label, blocks, pageName } = req.body;
    const page: page = {
      channelId: channelId,
      pageName: pageName,
      label: label,
      blocks: blocks,
    };

    const pushPage = await pageService.pushPage(id, page);

    res.json(pushPage);
  };

  deletePage: AsyncRequestHandler = async (req, res) => {
    const id = req.params.id;
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const deletePage = await pageService.deletePage(id, channelId);
    res.json(deletePage);
  };

  imageUpload: AsyncRequestHandler = async (req, res) => {
    // const id = req.params.id;
    // const channel = req.query.channel as string;
    // const channelId = parseInt(channel);
    const file = {
      // _id: id,
      // channelId: channelId,
      filePath: req.file.location,
    };

    res.json(file);
  };

  imageDelete: AsyncRequestHandler = async (req, res) => {
    const deleteImageKey = req.body.imgKey;
    const fileKey = deleteImageKey.split("/").pop().split("?")[0];
    const deleteImg = await deleteImage(fileKey);
    res.json(deleteImg);
  };
}

export const pageController = new PageController();
