import { pageService, templateService } from "../services";
import { page } from "../interface";
import { AsyncRequestHandler } from "../constants";
import redisCache from "../utils/redisCache";
import { mongoTransaction, MongoTransaction } from "../db";
import { ClientSession } from "mongoose";

interface IPageController {
  createPage: AsyncRequestHandler;
  pushBlock: AsyncRequestHandler;
  createRoom: AsyncRequestHandler;
  getChat: AsyncRequestHandler;
  findPage: AsyncRequestHandler;
  deletePage: AsyncRequestHandler;
}

export class PageController implements IPageController {
  constructor(private mongoTransaction: MongoTransaction) {
    this.mongoTransaction = mongoTransaction;
  }

  findPage: AsyncRequestHandler = async (req, res) => {
    const { id, channel, type } = req.body;
    if (
      type === "normal" ||
      type === "progress-page" ||
      type === "normal-page"
    ) {
      const findPosteResult = await this.mongoTransaction.withTransaction(
        async (session: ClientSession) => {
          const findPost = await pageService.findPage(channel, id, type);
          return findPost;
        }
      );
      res.json(findPosteResult);
    }
    if (type === "template-progress" || type === "template-normal") {
      const findProgressResult = await this.mongoTransaction.withTransaction(
        async (session: ClientSession) => {
          const findProgress = await templateService.findTemplate(
            channel,
            id,
            session,
            type
          );
          return findProgress;
        }
      );

      res.json(findProgressResult);
    }
  };

  createPage: AsyncRequestHandler = async (req, res) => {
    const { blockId, channel } = req.body;
    const createPageResult = await this.mongoTransaction.withTransaction(
      async (session: ClientSession) => {
        const createPage = await pageService.createPage(
          channel,
          blockId,
          session
        );
        return createPage;
      }
    );
    res.json(createPageResult);
  };

  createRoom: AsyncRequestHandler = async (req, res) => {
    const channel = req.body.channel;
    const createRoomPageResult = await this.mongoTransaction.withTransaction(
      async (session: ClientSession) => {
        const createPage = await pageService.createRoom(channel, session);
        return createPage;
      }
    );
    res.json(createRoomPageResult);
  };

  pushBlock: AsyncRequestHandler = async (req, res) => {
    const { id, channel, label, blocks, pageName } = req.body;
    const pushBlockResult = await this.mongoTransaction.withTransaction(
      async (session: ClientSession) => {
        const page: page = {
          channelId: channel,
          pageName: pageName,
          label: label,
          blocks: blocks,
        };

        const pushPage = await pageService.pushBlock(id, page, session);
        return pushPage;
      }
    );

    res.json(pushBlockResult);
  };

  editRoomName: AsyncRequestHandler = async (req, res) => {
    const { id, channel, pageName } = req.body;
    const result = await pageService.editRoomName(id, channel, pageName);
    res.json(result);
  };
  deletePage: AsyncRequestHandler = async (req, res) => {
    const { id, channel, type, templateId } = req.body;
    if (type !== "normal") {
      const templateInEditablePageResult =
        await this.mongoTransaction.withTransaction(
          async (session: ClientSession) => {
            if (!templateId) {
              throw new Error("template id 를 일력하세요.");
            }
            const templateInEditablePage =
              await templateService.templateInEditablePageDeleteOne(
                templateId,
                id,
                channel,
                type,
                session
              );
            return templateInEditablePage;
          }
        );
      res.json(templateInEditablePageResult);
    } else {
      const deletePageResult = await this.mongoTransaction.withTransaction(
        async (session: ClientSession) => {
          const deletePage = await pageService.deletePage(id, channel, session);
          return deletePage;
        }
      );
      res.json(deletePageResult);
    }
  };

  getChat: AsyncRequestHandler = async (req, res) => {
    const { userId } = req.user;
    const roomId = req.params.id;

    const messages = await pageService.getMessage(roomId);
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
    res.json({ roomId, messages });
  };
}

export const pageController = new PageController(mongoTransaction);
