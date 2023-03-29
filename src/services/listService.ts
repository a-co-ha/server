import { listModel, listModelType } from "../model";
import { IListModel, list, page, template } from "../interface";
import { ListInterface } from "../model/schema/listSchema";

class ListService implements IListModel {
  private listModel: listModelType;
  constructor(listModel: listModelType) {
    this.listModel = listModel;
  }

  async createList(channelId: number): Promise<ListInterface> {
    const list = await listModel.create({ channelId });
    return list;
  }
  async createListPage(channelId: number, page: page): Promise<ListInterface> {
    const list = await listModel.findOne({ channelId });
    const listId = list._id;
    const pushTemplateList = await listModel.findByIdAndUpdate(
      { _id: listId },
      { $push: { ListPage: { page } } }
    );

    return pushTemplateList;
  }

  async createListTemplate(
    channelId: number,
    template: template
  ): Promise<ListInterface> {
    const list = await listModel.findOne({ channelId });
    const listId = list._id;
    const pushTemplateList = await listModel.findByIdAndUpdate(
      { _id: listId },
      { $push: { ListPage: { template } } }
    );

    return pushTemplateList;
  }
  async findList(channelId: number): Promise<ListInterface> {
    const list = await listModel.findOne({ channelId });
    const listId = list._id;
    const listPage = await listModel.findOne({ _id: listId }).populate({
      path: "ListPage.page ListPage.template",
      select: "pageName type categories",
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

    console.log(findList);

    const listTemplateId = findList.ListPage[0]._id;
    const deleteList = await listModel.findByIdAndUpdate(
      { _id },
      { $pull: { ListPage: { _id: listTemplateId } } }
    );

    return deleteList;
  }
}

export const listService = new ListService(listModel);
