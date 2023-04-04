import { socketModel, socketModelType } from "./../model/index";
import { listModel, listModelType, pageModel, pageModelType } from "../model";
import { IPageModel, block, page } from "../interface";
import { listService } from "./listService";
import { ListInterface } from "../model/schema/listSchema";
export class PageService implements IPageModel {
  private pageModel: pageModelType;
  private listModel: listModelType;
  private socketModel: socketModelType;
  constructor(
    pageModel: pageModelType,
    listModel: listModelType,
    socketModel: socketModelType
  ) {
    this.pageModel = pageModel;
    this.listModel = listModel;
    this.socketModel = socketModel;
  }

  async findPage(channelId: number, id: string, type?: string): Promise<page> {
    const page = this.pageModel.findOne({ _id: id, type });
    return await page.findOne({ channelId });
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
  async createRoom(channelId: number): Promise<any> {
    return await this.socketModel.create({ channelId });
  }

  async createListPage(channelId: number, page: page): Promise<ListInterface> {
    const list = await listModel.findOne({ channelId });

    const listId = list._id;
    const room = await this.createRoom(channelId);
    console.log(room);
    const pushTemplateList = await this.listModel.findByIdAndUpdate(
      { _id: listId },
      { $push: { EditablePage: { page }, SocketPage: { room: room } } }
    );

    return pushTemplateList;
  }

  async pushPage(id: string, page: page): Promise<page> {
    const { channelId, label, pageName, blocks } = page;
    return await this.pageModel.findOneAndUpdate(
      { _id: id, channelId },
      {
        pageName: pageName,
        label: label,
        blocks: blocks,
      },
      { new: true }
    );
  }

  async pageStatusUpdate(id: string, progressStatus: string): Promise<page> {
    return await this.pageModel.findByIdAndUpdate(
      { _id: id },
      { progressStatus }
    );
  }

  async deletePage(id: string, channelId: number): Promise<object> {
    const deletePage = await this.pageModel.deleteOne({ _id: id });
    await listService.deleteListPage(channelId, id);

    return deletePage;
  }
}

export const pageService = new PageService(pageModel, listModel, socketModel);
