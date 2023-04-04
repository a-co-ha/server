import { listModel, listModelType, pageModel } from "../model";
import { list, template } from "../interface";
import { ListInterface } from "../model/schema/listSchema";
import { templateModel } from "../model/index";

export class ListService {
  private listModel: listModelType;
  constructor(listModel: listModelType) {
    this.listModel = listModel;
  }

  async findList(channelId: number): Promise<ListInterface> {
    const list = await listModel.findOne({ channelId });
    const listId = list._id;
    const listPage = await listModel.findOne({ _id: listId }).populate({
      path: "ListPage.page ListPage.template SocketPage.room",
      select: "pageName type categories roomName",
    });

    return listPage;
  }

  async updateList(channelId: number, listPage: list): Promise<ListInterface> {
    const list = await listModel.findOne({ channelId });

    const listId = list._id;
    return await listModel
      .findByIdAndUpdate({ _id: listId }, { ListPage: listPage })
      .then(() => this.findList(channelId));
  }

  async deleteListPage(channelId: number, id: string): Promise<ListInterface> {
    const list = await listModel.findOne({ channelId });
    const { _id } = list;

    const findList = await listModel.findById(
      { _id },
      { ListPage: { $elemMatch: { page: id } } }
    );
    const listPageId = findList.ListPage[0]._id;
    const deleteList = await listModel.findByIdAndUpdate(
      { _id },
      { $pull: { ListPage: { _id: listPageId } } }
    );

    return deleteList;
  }

  async deleteListTemplate(
    channelId: number,
    id: string
  ): Promise<ListInterface> {
    const list = await listModel.findOne({ channelId });
    const { _id } = list;

    const findList = await listModel.findById(
      { _id },
      { ListPage: { $elemMatch: { template: id } } }
    );

    const listTemplateId = findList.ListPage[0]._id;
    const deleteList = await listModel.findByIdAndUpdate(
      { _id },
      { $pull: { ListPage: { _id: listTemplateId } } }
    );

    return deleteList;
  }

  async deleteList(channelId: number): Promise<list> {
    const list = await listModel.findOne({ channelId });
    if (!list) {
      throw new Error("채널이 없습니다.");
    }
    const _id = list._id;
    await pageModel.deleteMany({ channelId });
    await templateModel.deleteMany({ channelId });
    return listModel.findByIdAndDelete({ _id });
  }
}

export const listService = new ListService(listModel);
