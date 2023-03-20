import { listModel, listModelType } from "../model";
import { IListModel, page, template } from "../interface";
import { channel } from "diagnostics_channel";

class ListService implements IListModel {
  private listModel: listModelType;
  constructor(listModel: listModelType) {
    this.listModel = listModel;
  }

  async createList(channelId: number): Promise<any> {
    const list = await listModel.create({ channelId });
    return list;
  }
  async createListPage(channelId: number, page: page): Promise<any> {
    const list = await listModel.findOne({ channelId });
    const listId = list._id;
    const pushTemplateList = await listModel.findByIdAndUpdate(
      { _id: listId },
      { $push: { ListPage: page } }
    );

    return pushTemplateList;
  }

  async createListTemplate(
    channelId: number,
    template: template
  ): Promise<any> {
    const list = await listModel.findOne({ channelId });
    const listId = list._id;
    const pushTemplateList = await listModel.findByIdAndUpdate(
      { _id: listId },
      { $push: { ListTemplate: template } }
    );

    return pushTemplateList;
  }
  async findList(channelId: number): Promise<any> {
    const list = await listModel.findOne({ channelId });
    const listId = list._id;
    const listPage = await listModel.findOne({ _id: listId }).populate({
      path: "ListPage ListTemplate",
      select: "pageName type categories",
    });

    return listPage;
  }
}

export const listService = new ListService(listModel);
