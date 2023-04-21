import { socketModel, socketModelType } from "./../model/index";
import { listModel, listModelType, pageModel, pageModelType } from "../model";
import { IPageModel, block, page } from "../interface";
import { ListService, listService } from "./listService";
import { ListInterface } from "../model/schema/listSchema";
import { mongoTransaction, MongoTransaction } from "../db";
import { Message, messageModel } from "../model/message";
import { User } from "../model/user";
import { ClientSession } from "mongoose";

export class PageService {
  private pageModel: pageModelType;
  private listModel: listModelType;
  private socketModel: socketModelType;
  private mongoTransaction: MongoTransaction;
  private messageModel: Message;
  private listService: ListService;
  constructor(
    pageModel: pageModelType,
    listModel: listModelType,
    socketModel: socketModelType,
    mongoTransaction: MongoTransaction,
    messageModel: Message,
    listService: ListService
  ) {
    this.pageModel = pageModel;
    this.listModel = listModel;
    this.socketModel = socketModel;
    this.mongoTransaction = mongoTransaction;
    this.messageModel = messageModel;
    this.listService = listService;
  }

  public async findPage(
    channelId: number,
    id: string,
    type?: string
  ): Promise<page> {
    const result = await this.pageModel.findOne({ _id: id, channelId, type });
    return result;
  }

  public async createPage(
    channelId: number,
    blockId: string,
    session: ClientSession,
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
    session: ClientSession
  ): Promise<any> {
    const room = await this.socketModel.create([{ channelId }], { session });
    return this.createSocketPageList(channelId, room[0]);
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
    room: any
  ): Promise<any> {
    const session = await this.mongoTransaction.startTransaction();
    try {
      const list = await listModel.findOne({ channelId });
      const listId = list._id;
      const pushTemplateList = await this.listModel
        .findByIdAndUpdate(
          { _id: listId },
          { $push: { SocketPage: { page: room } } }
        )
        .session(session);
      await this.mongoTransaction.commitTransaction(session);
      return pushTemplateList;
    } catch (error) {
      await this.mongoTransaction.abortTransaction(session);
      throw error;
    } finally {
      session.endSession();
    }
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

  public async getMessage(roomId: string): Promise<any[]> {
    const messages: any = await Message.findAll({
      include: {
        model: User,
        attributes: ["userId"],
      },
      where: { roomId },
      attributes: {
        exclude: ["id", "roomId"],
      },
      raw: true,
    });

    const modifiedMessages = messages.map((message) => {
      const modifiedMessage = { ...message };
      modifiedMessage.userId = message["user.userId"];
      delete modifiedMessage["user.userId"];
      return modifiedMessage;
    });

    return modifiedMessages;
  }
}

export const pageService = new PageService(
  pageModel,
  listModel,
  socketModel,
  mongoTransaction,
  messageModel,
  listService
);
