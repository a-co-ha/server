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
      path: "EditablePage.page EditablePage.template SocketPage.page",
      select: "pageName type categories pageName",
    });

    return listPage;
  }

  async updateList(channelId: number, listPage: list): Promise<ListInterface> {
    const list = await listModel.findOne({ channelId });

    const listId = list._id;

    return await listModel
      .findByIdAndUpdate({ _id: listId }, { EditablePage: listPage })
      .then(() => this.findList(channelId));
  }

  async deleteListPage(channelId: number, id: string): Promise<ListInterface> {
    const list = await listModel.findOne({ channelId });
    const { _id } = list;

    const findList = await listModel.findById(
      { _id },
      { EditablePage: { $elemMatch: { page: id } } }
    );
    const listPageId = findList.EditablePage[0]._id;
    const deleteList = await listModel.findByIdAndUpdate(
      { _id },
      { $pull: { EditablePage: { _id: listPageId } } }
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
      { EditablePage: { $elemMatch: { template: id } } }
    );

    const listTemplateId = findList.EditablePage[0]._id;
    const deleteList = await listModel.findByIdAndUpdate(
      { _id },
      { $pull: { EditablePage: { _id: listTemplateId } } }
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
