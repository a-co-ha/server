import { ClientSession } from "mongoose";
import { ERROR_NAME } from "../constants";
import { list, ListInterface } from "../interface";
import {
  listModel,
  listModelType,
  pageModel,
  pageModelType,
  templateModel,
  templateModelType,
} from "../model";

export class ListService {
  constructor(
    private listModel: listModelType,
    private pageModel: pageModelType,
    private templateModel: templateModelType
  ) {}
  public async findList(channelId: number): Promise<ListInterface> {
    const list = await this.listModel.findOne({ channelId });
    const listId = list._id;
    const listPage = await this.listModel.findOne({ _id: listId }).populate({
      path: "EditablePage.page EditablePage.template SocketPage.page",
      select: "pageName type categories pageName",
    });

    return listPage;
  }

  public async updateList(
    channelId: number,
    EditablePage: list,
    session: ClientSession
  ): Promise<ListInterface> {
    const list = await this.listModel.findOne({ channelId });

    const listId = list._id;
    return await this.listModel
      .findByIdAndUpdate({ _id: listId }, { EditablePage })
      .session(session)
      .then(() => this.findList(channelId));
  }

  public async deleteListPage(
    channelId: number,
    id: string,
    session: ClientSession
  ): Promise<ListInterface> {
    const list = await this.listModel.findOne(
      {
        channelId,
      },
      { EditablePage: { $elemMatch: { page: id } } }
    );

    const listPageId = list.EditablePage[0]._id;
    const deleteList = await this.listModel
      .findOneAndUpdate(
        { channelId },
        { $pull: { EditablePage: { _id: listPageId } } }
      )
      .session(session);

    return deleteList;
  }

  public async deleteListTemplate(
    channelId: number,
    id: string,
    session: ClientSession
  ): Promise<ListInterface> {
    const list = await this.listModel.findOne(
      { channelId },
      { EditablePage: { $elemMatch: { template: id } } }
    );

    const listTemplateId = list.EditablePage[0]._id;
    const deleteList = await this.listModel
      .findOneAndUpdate(
        { channelId },
        { $pull: { EditablePage: { _id: listTemplateId } } }
      )
      .session(session);

    return deleteList;
  }

  public async deleteListSocket(
    channelId: number,
    id: string
  ): Promise<ListInterface> {
    const list = await this.listModel.findOne(
      {
        channelId,
      },
      { SocketPage: { $elemMatch: { page: id } } }
    );

    const listPageId = list.SocketPage[0]._id;
    return await this.listModel
      .findOneAndUpdate(
        { channelId },
        { $pull: { SocketPage: { _id: listPageId } } }
      )
      .then(async () => {
        return await this.findList(channelId);
      });
  }

  public async deleteList(channelId: number): Promise<list> {
    const list = await this.listModel.findOne({ channelId });
    if (!list) {
      throw new Error(ERROR_NAME.NOT_FOUND_CHANNEL);
    }
    const _id = list._id;
    await this.pageModel.deleteMany({ channelId });
    await this.templateModel.deleteMany({ channelId });
    return this.listModel.findByIdAndDelete({ _id });
  }
}

export const listService = new ListService(listModel, pageModel, templateModel);
