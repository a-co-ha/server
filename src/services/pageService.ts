import { pageModel, pageModelType, templateModel } from "../model";
import { IPageModel, block, page } from "../interface";
class PageService implements IPageModel {
  private pageModel: pageModelType;
  constructor(pageModel: pageModelType) {
    this.pageModel = pageModel;
  }

  async findPage(channelId: number, id: string, type?: string): Promise<page> {
    const page = this.pageModel.findOne({ _id: id, type });
    return await page.findOne({ channelId });
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

    return page;
  }

  async pushPage(id: string, page: page): Promise<page> {
    const { channelId, label, pageName, blocks } = page;
    return await this.pageModel.findOneAndUpdate(
      { _id: id },
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

  async deletePage(id: string): Promise<object> {
    return await this.pageModel.deleteOne({ _id: id });
  }

  async findPageList(channelId: number): Promise<page[]> {
    const findPage = await pageModel.aggregate([
      { $match: { channelId: channelId, type: "normal" } },
      {
        $group: {
          _id: "$_id",
          pageName: { $last: "$pageName" },
          type: { $last: "$type" },
          categories: { $last: "$categories" },
        },
      },
    ]);
    // const findProgress = await templateModel.aggregate([
    //   {
    //     $match: {
    //       channelId: channelId,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       pageName: { $last: "$pageName" },
    //       type: { $last: "$type" },
    //       categories: { $last: "$categories" },
    //     },
    //   },
    // ]);

    // const findList = { List: [...findPage, ...findProgress] };
    return findPage;
  }
}

export const pageService = new PageService(pageModel);
