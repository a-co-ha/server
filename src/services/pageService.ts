import { pageModel, pageModelType, templateModel } from "../model";
import { IPageModel, block, page } from "../interface";
import { listService } from "./listService";
class PageService implements IPageModel {
  private pageModel: pageModelType;
  constructor(pageModel: pageModelType) {
    this.pageModel = pageModel;
  }

  async findPage(channelId: number, id: string, type?: string): Promise<page> {
    return await pageModel.findOne({ _id: id, channelId, type });
  }

  async createPage(
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
      await listService.createListPage(channelId, page);
    }

    return page;
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

export const pageService = new PageService(pageModel);
