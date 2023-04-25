import {
  socketModel,
  socketModelType,
  templateModelType,
  templateModel,
} from "./../model/index";
import { listModel, listModelType, pageModel, pageModelType } from "../model";
import { IPageModel, block, page } from "../interface";
import { ListService, listService } from "./listService";
import { ListInterface } from "../model/schema/listSchema";
import { mongoTransaction, MongoTransaction } from "../db";
import { ClientSession } from "mongoose";
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

  public async findPage(
    channelId: number,
    id: string,
    type?: string
  ): Promise<page> {
    const result = await (
      await this.pageModel.findOne({ _id: id, channelId, type })
    ).populate({
      path: "parentTemplate",
      select: "pageName",
    });
    return result;
  }

  public async createPage(
    channelId: number,
    blockId: string,
    session?: ClientSession,
    type?: string,
    progressStatus?: string
  ): Promise<any> {
    const blocks: block = {
      blockId: blockId,
      tag: "p",
      html: "",
      imgUrl: "",
    };

    const page = await this.pageModel.create(
      [
        {
          channelId,
          blocks,
          type,
          progressStatus,
        },
      ],
      { session }
    );
    if (!type) {
      await this.pushListPage(channelId, page[0], session);
    }

    return page[0];
  }

  public async createRoom(
    channelId: number,
    session?: ClientSession
  ): Promise<any> {
    const room = await this.socketModel.create([{ channelId }], { session });
    return await this.createSocketPageList(channelId, room[0], session).then(
      () => this.listService.findList(channelId)
    );
  }

  public async pushListPage(
    channelId: number,
    page: any,
    session: ClientSession
  ): Promise<ListInterface> {
    const list = await listModel.findOne({ channelId });
    const listId = list._id;
    const pushTemplateList = await this.listModel
      .findByIdAndUpdate({ _id: listId }, { $push: { EditablePage: { page } } })
      .session(session);
    return pushTemplateList;
  }

  public async createSocketPageList(
    channelId: number,
    room: any,
    session: ClientSession
  ): Promise<any> {
    const list = await listModel.findOne({ channelId });
    const listId = list._id;
    const pushTemplateList = await this.listModel
      .findByIdAndUpdate(
        { _id: listId },
        { $push: { SocketPage: { page: room } } }
      )
      .session(session);

    return pushTemplateList;
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

  public async pushBlock(
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

  public async deletePage(
    id: string,
    channelId: number,
    session: ClientSession
  ): Promise<object> {
    const deletePage = await this.pageModel
      .deleteOne({ _id: id })
      .session(session);
    await this.listService.deleteListPage(channelId, id, session);
    return deletePage;
  }

  public async pageTemplateSearch(
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
          "blocks.html": 1,
          type: 1,
          parentTemplate: 1,
          label: 1,
        }
      )
      .populate({
        path: "parentTemplate",
        select: "pageName",
      });

    const searchTemplate = await this.templateModel.find({
      channelId,
      $or: [{ pageName: { $regex: searchRegex } }],
    });

    const searchResult = {
      page: searchPage,
      template: searchTemplate,
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
