import {
  socketModel,
  socketModelType,
  templateModelType,
  templateModel,
} from "./../model/index";
import { listModel, listModelType, pageModel, pageModelType } from "../model";
import {
  basicPageOrTemplateInfo,
  block,
  createPageOrTemplateInfo,
  page,
  putPageOrSocketInList,
} from "../interface/pageInterface";
import { ListService, listService } from "./listService";
import { ListInterface } from "../model/schema/listSchema";
import { mongoTransaction, MongoTransaction } from "../db";
import { ClientSession } from "mongoose";
import { ObjectId } from "mongodb";
export class PageService {
  private pageModel: pageModelType;
  private listModel: listModelType;
  private socketModel: socketModelType;
  private mongoTransaction: MongoTransaction;
  private listService: ListService;
  private templateModel: templateModelType;
  constructor(
    pageModel: pageModelType,
    listModel: listModelType,
    socketModel: socketModelType,
    mongoTransaction: MongoTransaction,
    listService: ListService,
    templateModel: templateModelType
  ) {
    this.pageModel = pageModel;
    this.listModel = listModel;
    this.socketModel = socketModel;
    this.mongoTransaction = mongoTransaction;
    this.listService = listService;
    this.templateModel = templateModel;
  }

  public async findPageNameByPageId(pageId: string): Promise<page> {
    return await this.pageModel.findById(
      {
        _id: new ObjectId(pageId),
      },
      { pageName: 1 }
    );
  }
  public async findPage(pageInfo: basicPageOrTemplateInfo): Promise<page> {
    const { id, channelId, type, session } = pageInfo;

    const result = await this.pageModel
      .findOne({ _id: id, channelId, type })
      .session(session)
      .populate({
        path: "parentTemplate",
        select: "pageName",
      });

    return result;
  }

  public async createPage(
    createPageInfo: createPageOrTemplateInfo
  ): Promise<any> {
    const { channelId, blockId, session, parentTemplateInfo } = createPageInfo;
    const blocks: block = {
      blockId: blockId,
      tag: "p",
      html: "",
      imgUrl: "",
    };
    if (parentTemplateInfo) {
      const { pageType, parentTemplate, progressStatus } = parentTemplateInfo;
      const page = await this.pageModel.create(
        [
          {
            channelId,
            blocks,
            type: pageType,
            progressStatus,
            parentTemplate,
          },
        ],
        { session }
      );
      return page[0];
    }

    const page = await this.pageModel.create(
      [
        {
          channelId,
          blocks,
        },
      ],
      { session }
    );

    if (!parentTemplateInfo) {
      const putPageInListInfo: putPageOrSocketInList = {
        channelId,
        page: page[0],
        session,
      };
      await this.putPageInList(putPageInListInfo);
    }

    return page[0];
  }

  public async createRoom(
    channelId: number,
    session?: ClientSession
  ): Promise<any> {
    const room = await this.socketModel.create([{ channelId }], { session });
    const putSocketInListInfo: putPageOrSocketInList = {
      channelId,
      room: room[0],
      session,
    };

    await this.createSocketPageList(putSocketInListInfo);
    return room[0];
    // .then(
    //   () => this.listService.findList(channelId)
    // );
  }

  public async putPageInList(
    putPageInListInfo: putPageOrSocketInList
  ): Promise<ListInterface> {
    const { channelId, page, session } = putPageInListInfo;

    const list = await listModel.findOne({ channelId });
    const listId = list._id;
    const pageInsideList = await this.listModel
      .findByIdAndUpdate({ _id: listId }, { $push: { EditablePage: { page } } })
      .session(session);
    return pageInsideList;
  }

  public async createSocketPageList(
    putSocketInList: putPageOrSocketInList
  ): Promise<any> {
    const { channelId, room, session } = putSocketInList;

    const list = await listModel.findOne({ channelId });
    const listId = list._id;
    const socketInsideList = await this.listModel
      .findByIdAndUpdate(
        { _id: listId },
        { $push: { SocketPage: { page: room } } }
      )
      .session(session);

    return socketInsideList;
  }
  public async editRoomName(
    id: string,
    channel: number,
    pageName: string
  ): Promise<ListInterface> {
    return await this.socketModel
      .findOneAndUpdate(
        { _id: id, channelId: channel },
        {
          pageName: pageName,
        },
        { new: true }
      )
      .then(() => this.listService.findList(channel));
  }

  public async putBlockInEditablePage(
    id: string,
    page: page,
    session: ClientSession
  ): Promise<page> {
    const { channelId, label, pageName, blocks } = page;
    const result = await this.pageModel
      .findOneAndUpdate(
        { _id: id, channelId },
        {
          pageName: pageName,
          label: label,
          blocks: blocks,
        },
        { new: true }
      )
      .session(session);
    return result;
  }

  public async pageStatusUpdate(
    id: string,
    progressStatus: string
  ): Promise<page> {
    const result = await this.pageModel.findByIdAndUpdate(
      { _id: id },
      { progressStatus }
    );
    return result;
  }

  public async deletePage(pageInfo: basicPageOrTemplateInfo): Promise<object> {
    const { id, channelId, session } = pageInfo;
    const deletePage = await this.pageModel
      .deleteOne({ _id: id })
      .session(session);
    await this.listService.deleteListPage(channelId, id, session);
    return deletePage;
  }

  public async pageAndTemplateSearch(
    channelId: number,
    searchTerms: string
  ): Promise<any> {
    const searchRegex = new RegExp(searchTerms, "i");
    const searchPage = await this.pageModel
      .find(
        {
          channelId,
          $or: [
            { pageName: { $regex: searchRegex } },
            { blocks: { $elemMatch: { html: { $regex: searchRegex } } } },
          ],
        },
        {
          id: 1,
          pageName: 1,
          blocks: { $elemMatch: { html: { $regex: searchRegex } } },
          type: 1,
          parentTemplate: 1,
          label: 1,
        }
      )
      .populate({
        path: "parentTemplate",
        select: "pageName",
      });

    const searchTemplate = await this.templateModel.find(
      {
        channelId,
        $or: [{ pageName: { $regex: searchRegex } }],
      },
      {
        id: 1,
        pageName: 1,
        type: 1,
      }
    );

    const searchResult = {
      EditablePage: searchPage,
      Template: searchTemplate,
    };

    return searchResult;
  }
}

export const pageService = new PageService(
  pageModel,
  listModel,
  socketModel,
  mongoTransaction,
  listService,
  templateModel
);
