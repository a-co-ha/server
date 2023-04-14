import { socketModel, socketModelType } from "./../model/index";
import { listModel, listModelType, pageModel, pageModelType } from "../model";
import { IPageModel, block, page } from "../interface";
import { listService } from "./listService";
import { ListInterface } from "../model/schema/listSchema";
import { MongoAdapter } from "../db/mongo";
export class PageService implements IPageModel {
  private pageModel: pageModelType;
  private listModel: listModelType;
  private socketModel: socketModelType;
  private mongoAdapter: MongoAdapter;
  constructor(
    pageModel: pageModelType,
    listModel: listModelType,
    socketModel: socketModelType
  ) {
    this.pageModel = pageModel;
    this.listModel = listModel;
    this.socketModel = socketModel;
    this.mongoAdapter = new MongoAdapter();
  }

  public async findPage(
    channelId: number,
    id: string,
    type?: string
  ): Promise<page> {
    const session = await this.mongoAdapter.startTransaction();
    try {
      const result = await pageModel
        .findOne({ _id: id, channelId, type })
        .session(session);
      await this.mongoAdapter.commitTransaction(session);
      return result;
    } catch (error) {
      await this.mongoAdapter.abortTransaction(session);
      throw error;
    } finally {
      session.endSession();
    }
  }

  public async createPage(
    channelId: number,
    blockId: string,
    type?: string,
    progressStatus?: string
  ): Promise<page> {
    const blocks: block = {
      blockId: blockId,
      tag: "p",
      html: "",
      imgUrl: "",
    };
    const page = await this.pageModel.create({
      channelId,
      blocks,
      type,
      progressStatus,
    });
    if (!type) {
      await this.createListPage(channelId, page);
    }

    return page;
  }

  public async createRoom(channelId: number): Promise<any> {
    const room = await this.socketModel.create({ channelId });
    return this.createSocketPageList(channelId, room);
  }

  public async createListPage(
    channelId: number,
    page: page
  ): Promise<ListInterface> {
    const list = await listModel.findOne({ channelId });

    const listId = list._id;

    const pushTemplateList = await this.listModel.findByIdAndUpdate(
      { _id: listId },
      { $push: { EditablePage: { page } } }
    );

    return pushTemplateList;
  }

  public async createSocketPageList(
    channelId: number,
    room: any
  ): Promise<any> {
    const list = await listModel.findOne({ channelId });

    const listId = list._id;

    const pushTemplateList = await this.listModel.findByIdAndUpdate(
      { _id: listId },
      { $push: { SocketPage: { room } } }
    );

    return pushTemplateList;
  }

  public async pushBlock(id: string, page: page): Promise<page> {
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
      return result;
    }
  

  public async pageStatusUpdate(
    id: string,
    progressStatus: string
  ): Promise<page> {
    return await this.pageModel.findByIdAndUpdate(
      { _id: id },
      { progressStatus }
    );
  }

  public async deletePage(id: string, channelId: number): Promise<object> {
    const deletePage = await this.pageModel.deleteOne({ _id: id });
    await listService.deleteListPage(channelId, id);

    return deletePage;
  }
}

export const pageService = new PageService(pageModel, listModel, socketModel);
