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
import { PAGE_TYPE } from "../constants";

interface IPageController {
  createPage: AsyncRequestHandler;
  putBlockInEditablePage: AsyncRequestHandler;
  createRoom: AsyncRequestHandler;
  findPage: AsyncRequestHandler;
  deletePage: AsyncRequestHandler;
  pageAndTemplateSearch: AsyncRequestHandler;
  recentlyCreated: AsyncRequestHandler;
  deleteRoom: AsyncRequestHandler;
}

export class PageController implements IPageController {
  constructor(private mongoTransaction: MongoTransaction) {}

  public findPage: AsyncRequestHandler = async (req, res) => {
    const { id, channel, type } = req.body;
    if (
      type === PAGE_TYPE.NORMAL ||
      type === PAGE_TYPE.PROGRESSIVE ||
      type === PAGE_TYPE.NORMALIZE
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
      type === PAGE_TYPE.TEMPLATE_PROGRESSIVE ||
      type === PAGE_TYPE.TEMPLATE_NORMAL
    ) {
      const findProgressResult = await this.mongoTransaction.withTransaction(
        async (session: ClientSession) => {
          const templateInfo: basicPageOrTemplateInfo = {
            channelId: channel,
            id,
            session,
            type,
          };
          if (type === PAGE_TYPE.TEMPLATE_PROGRESSIVE) {
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
        return await pageService.createPage(createPageInfo);
      }
    );
    res.json(createPageResult);
  };

  public createRoom: AsyncRequestHandler = async (req, res) => {
    const { channel } = req.body;
    const createRoomPageResult = await this.mongoTransaction.withTransaction(
      async (session: ClientSession) => {
        return await pageService.createRoom(channel, session);
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

        return await pageService.putBlockInEditablePage(id, page, session);
      }
    );

    res.json(pushBlockResult);
  };

  public editRoomName: AsyncRequestHandler = async (req, res) => {
    const { id, channel, pageName } = req.body;
    const result = await pageService.editRoomName(id, channel, pageName);
    res.json(result);
  };

  public deleteRoom: AsyncRequestHandler = async (req, res) => {
    const { id, channel } = req.body;
    const deleteRoomResult = await this.mongoTransaction.withTransaction(
      async (session: ClientSession) => {
        const deleteRoom = await pageService.deleteRooom(id, channel, session);
        return deleteRoom;
      }
    );
    res.json(deleteRoomResult);
  };

  public deletePage: AsyncRequestHandler = async (req, res) => {
    const { id, channel, type } = req.body;
    if (type !== PAGE_TYPE.NORMAL) {
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
          return await pageService.deletePage(deletePageInfo);
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
