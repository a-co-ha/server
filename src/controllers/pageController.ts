import { pageService, templateService } from "../services";
import { page } from "../interface";
import { AsyncRequestHandler } from "../constants";
import redisCache from "../utils/redisCache";

interface IPageController {
  createPage: AsyncRequestHandler;
  pushBlock: AsyncRequestHandler;
  findPage: AsyncRequestHandler;
  deletePage: AsyncRequestHandler;
  imageDelete: AsyncRequestHandler;
  imageUpload: AsyncRequestHandler;
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
    }
    if (type === "template-progress" || type === "template-normal") {
      const findProgress = await templateService.findTemplate(
        channel,
        id,
        type
      );
      res.json(findProgress);
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

  imageUpload: AsyncRequestHandler = async (req, res) => {
    const file = {
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

  getChat: AsyncRequestHandler = async (req, res) => {
    const { userId } = req.user;
    const roomId = req.params.id;

    const massages = await pageService.getMessage(roomId);
    // const messages = await redisCache.findMessagesForUser(roomId);
    // const messagesPerUser = new Map();
    // todo
    // for (const message of messages) {
    //   const { from, to } = message;
    //   const otherUser = userId === from ? to : from;

    //   if (messagesPerUser.has(otherUser)) {
    //     messagesPerUser.get(otherUser).push(message);
    //   } else {
    //     messagesPerUser.set(otherUser, [message]);
    //   }
    // }
    res.json({ roomId, massages });
  };
}

export const pageController = new PageController();
