import {
  pageService,
  templateNormalService,
  templateService,
} from "../services";
import {
  basicPageOrTemplateInfo,
  createPageOrTemplateInfo,
  page,
} from "../interface";
import { AsyncRequestHandler } from "../utils";
import { mongoTransaction, MongoTransaction } from "../db";
import { ClientSession } from "mongoose";
import { PageType } from "../constants";

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
  constructor(private mongoTransaction: MongoTransaction) {}

  public findPage: AsyncRequestHandler = async (req, res) => {
    const { id, channel, type } = req.body;
    if (
      type === PageType.NORMAL ||
      type === PageType.PROGRESSIVE ||
      type === PageType.NORMALIZE
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
    if (
      type === PageType.TEMPLATE_PROGRESSIVE ||
      type === PageType.TEMPLATE_NORMAL
    ) {
      const findProgressResult = await this.mongoTransaction.withTransaction(
        async (session: ClientSession) => {
          const templateInfo: basicPageOrTemplateInfo = {
            channelId: channel,
            id,
            session,
            type,
          };
          if (type === PageType.TEMPLATE_PROGRESSIVE) {
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

  public createPage: AsyncRequestHandler = async (req, res) => {
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

  public createRoom: AsyncRequestHandler = async (req, res) => {
    const { channel } = req.body;
    const createRoomPageResult = await this.mongoTransaction.withTransaction(
      async (session: ClientSession) => {
        const createPage = await pageService.createRoom(channel, session);
        return createPage;
      }
    );
    res.json(createRoomPageResult);
  };

  public putBlockInEditablePage: AsyncRequestHandler = async (req, res) => {
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

  public editRoomName: AsyncRequestHandler = async (req, res) => {
    const { id, channel, pageName } = req.body;
    const result = await pageService.editRoomName(id, channel, pageName);
    res.json(result);
  };

  public deletePage: AsyncRequestHandler = async (req, res) => {
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

  public pageAndTemplateSearch: AsyncRequestHandler = async (req, res) => {
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
