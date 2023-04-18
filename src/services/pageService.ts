import { socketModel, socketModelType } from "./../model/index";
import { listModel, listModelType, pageModel, pageModelType } from "../model";
import { IPageModel, block, page } from "../interface";
import { listService } from "./listService";
import { ListInterface } from "../model/schema/listSchema";
import { mongoTransaction, MongoTransaction } from "../db"
import { Message, messageModel } from "../model/message";
import { User } from "../model/user";
export class PageService  {
  private pageModel: pageModelType;
  private listModel: listModelType;
  private socketModel: socketModelType;
  private mongoTransaction: MongoTransaction;
  private messageModel: Message;
  constructor(
    pageModel: pageModelType,
    listModel: listModelType,
    socketModel: socketModelType,
    mongoTransaction: MongoTransaction,
    messageModel: Message
  ) {
    this.pageModel = pageModel;
    this.listModel = listModel;
    this.socketModel = socketModel;
    this.mongoTransaction = mongoTransaction;
    this.messageModel = messageModel;
  }

  public async findPage(
    channelId: number,
    id: string,
    type?: string
  ): Promise<page> {

    const result = await pageModel.findOne({ _id: id, channelId, type });
    return result;

  }

  public async createPage(
    channelId: number,
    blockId: string,
    type?: string,
    progressStatus?: string
  ): Promise<any> {
    const session = await this.mongoTransaction.startTransaction();
    const blocks: block = {
      blockId: blockId,
      tag: "p",
      html: "",
      imgUrl: "",
    };
    try {
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
        await this.createListPage(channelId, page[0]);
      }
      await this.mongoTransaction.commitTransaction(session);

      return page;
    } catch (error) {
      await this.mongoTransaction.abortTransaction(session);
      throw error;
    } finally {
      session.endSession();
    }
  }

  public async createRoom(channelId: number): Promise<any> {
    const session = await this.mongoTransaction.startTransaction();
    try {
      const room = await this.socketModel.create([{ channelId }], { session });
      await this.mongoTransaction.commitTransaction(session);
      return this.createSocketPageList(channelId, room[0]);
    } catch (error) {
      await this.mongoTransaction.abortTransaction(session);
      throw error;
    } finally {
      session.endSession();
    }
  }

  public async createListPage(
    channelId: number,
    page: any
  ): Promise<ListInterface> {
    const session = await this.mongoTransaction.startTransaction();
    try {
      const list = await listModel.findOne({ channelId });
      const listId = list._id;
      const pushTemplateList = await this.listModel
        .findByIdAndUpdate(
          { _id: listId },
          { $push: { EditablePage: { page } } }
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

  public async pushBlock(id: string, page: page): Promise<page> {
    const { channelId, label, pageName, blocks } = page;

    let session = await this.mongoTransaction.startTransaction();
    try {
      
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
          await this.mongoTransaction.commitTransaction(session);
          return result;
        }catch (error) {
          await this.mongoTransaction.abortTransaction(session);
          throw error;
        } finally {
          session.endSession();
        }
  }
  
  public async pageStatusUpdate(
    id: string,
    progressStatus: string
  ): Promise<page> {
    const session = await this.mongoTransaction.startTransaction();
    try {
      const result = await this.pageModel
        .findByIdAndUpdate({ _id: id }, { progressStatus })
        .session(session);
      await this.mongoTransaction.commitTransaction(session);
      return result;
    } catch (error) {
      await this.mongoTransaction.abortTransaction(session);
      throw error;
    } finally {
      session.endSession();
    }
  }

  public async deletePage(id: string, channelId: number): Promise<object> {
    const session = await this.mongoTransaction.startTransaction();
    try {
      const deletePage = await this.pageModel
        .deleteOne({ _id: id })
        .session(session);
      await listService.deleteListPage(channelId, id);
      await this.mongoTransaction.commitTransaction(session);
      return deletePage;
    } catch (error) {
      await this.mongoTransaction.abortTransaction(session);
      throw error;
    } finally {
      session.endSession();
    }
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
  messageModel
);
