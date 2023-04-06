import { pageService, templateService } from "../services";
import { block, page } from "../interface";
import { AsyncRequestHandler } from "../constants";

interface IPageController {
  createPage: AsyncRequestHandler;
  pushBlock: AsyncRequestHandler;
  findPage: AsyncRequestHandler;
  deletePage: AsyncRequestHandler;
}

export class PageController implements IPageController {
  findPage: AsyncRequestHandler = async (req, res) => {
    const { id, channel, type } = req.body;

    if (
      type === "normal" ||
      type === "progress-page" ||
      type === "normal-page"
    ) {
      const findPost = await pageService.findPage(channel, id, type);
      res.json(findPost);
    } else if (type === "template-progress" || type === "template-normal") {
      const findProgress = await templateService.findTemplate(
        channel,
        id,
        type
      );
      res.json(findProgress);
    } else {
      throw new Error("Type Error");
    }
  };

  createPage: AsyncRequestHandler = async (req, res) => {
    const { blockId, channel } = req.body;

    const createPage = await pageService.createPage(channel, blockId);
    res.json(createPage);
  };

  createRoom: AsyncRequestHandler = async (req, res) => {
    const channel = req.body.channel;
    const createPage = await pageService.createRoom(channel);
    res.json(createPage);
  };

  pushBlock: AsyncRequestHandler = async (req, res) => {
    const { id, channel, label, blocks, pageName } = req.body;

    const page: page = {
      channelId: channel,
      pageName: pageName,
      label: label,
      blocks: blocks,
    };

    const pushPage = await pageService.pushBlock(id, page);

    res.json(pushPage);
  };

  deletePage: AsyncRequestHandler = async (req, res) => {
    const { id, channel } = req.body;
    const deletePage = await pageService.deletePage(id, channel);
    res.json(deletePage);
  };
}

export const pageController = new PageController();
