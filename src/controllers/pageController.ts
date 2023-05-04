import {
  pageService,
  templateNormalService,
  templateService,
} from "../services";
import {
  basicPageOrTemplateInfo,
  createPageOrTemplateInfo,
  page,
} from "../interface/pageInterface";
import { AsyncRequestHandler, RedisHandler } from "../utils";
import { mongoTransaction, MongoTransaction } from "../db";
import { ClientSession } from "mongoose";

interface IPageController {
  createPage: AsyncRequestHandler;
  putBlockInEditablePage: AsyncRequestHandler;
  createRoom: AsyncRequestHandler;
  findPage: AsyncRequestHandler;
  deletePage: AsyncRequestHandler;
  pageAndTemplateSearch: AsyncRequestHandler;
  recentlyCreated: AsyncRequestHandler;
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
      const findEditablePageResult =
        await this.mongoTransaction.withTransaction(
          async (session: ClientSession) => {
            const pageInfo: basicPageOrTemplateInfo = {
              channelId: channel,
              id,
              session,
              type,
            };

            const findPost = await pageService.findPage(pageInfo);
            return findPost;
          }
        );
      res.json(findEditablePageResult);
    }
    if (type === "template-progress" || type === "template-normal") {
      const findProgressResult = await this.mongoTransaction.withTransaction(
        async (session: ClientSession) => {
          const templateInfo: basicPageOrTemplateInfo = {
            channelId: channel,
            id,
            session,
            type,
          };
          if (type === "template-progress") {
            const findTemplateProgress =
              await templateService.findTemplateProgress(templateInfo);
            return findTemplateProgress;
          } else {
            const findTemplateNormal =
              await templateNormalService.findTemplateNormal(templateInfo);
            return findTemplateNormal;
          }
        }
      );

      res.json(findProgressResult);
    }
  };

  createPage: AsyncRequestHandler = async (req, res) => {
    const { blockId, channel } = req.body;
    const createPageResult = await this.mongoTransaction.withTransaction(
      async (session: ClientSession) => {
        const createPageInfo: createPageOrTemplateInfo = {
          channelId: channel,
          blockId,
          session,
        };
        const createPage = await pageService.createPage(createPageInfo);
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

  putBlockInEditablePage: AsyncRequestHandler = async (req, res) => {
    const { id, channel, label, blocks, pageName } = req.body;
    const pushBlockResult = await this.mongoTransaction.withTransaction(
      async (session: ClientSession) => {
        const page: page = {
          channelId: channel,
          pageName: pageName,
          label: label,
          blocks: blocks,
        };

        const putBlockInEditablePage = await pageService.putBlockInEditablePage(
          id,
          page,
          session
        );
        return putBlockInEditablePage;
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
    const { id, channel, type } = req.body;
    if (type !== "normal") {
      const templateInEditablePageResult =
        await this.mongoTransaction.withTransaction(
          async (session: ClientSession) => {
            const templateInEditablePageDeleteOne =
              await templateService.templateInEditablePageDeleteOne(
                id,
                channel,
                type,
                session
              );
            return templateInEditablePageDeleteOne;
          }
        );
      res.json(templateInEditablePageResult);
    } else {
      const deletePageResult = await this.mongoTransaction.withTransaction(
        async (session: ClientSession) => {
          const deletePageInfo: basicPageOrTemplateInfo = {
            id,
            channelId: channel,
            session,
          };
          const deletePage = await pageService.deletePage(deletePageInfo);
          return deletePage;
        }
      );
      res.json(deletePageResult);
    }
  };

  pageAndTemplateSearch: AsyncRequestHandler = async (req, res) => {
    const { search, channel } = req.body;
    const searchResult = await pageService.pageAndTemplateSearch(
      channel,
      search
    );
    res.json(searchResult);
  };

  recentlyCreated: AsyncRequestHandler = async (req, res) => {
    const { channel } = req.body;

    const recentlyCreated = await pageService.recentlyCreated(channel);
    res.json(recentlyCreated);
  };
}

export const pageController = new PageController(mongoTransaction);
