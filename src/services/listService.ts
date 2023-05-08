import {
  listModel,
  listModelType,
  pageModel,
  pageModelType,
  templateModelType,
} from "../model";
import { list } from "../interface/listInterface";
import { ListInterface } from "../model/schema/listSchema";
import { templateModel } from "../model/index";
import { ClientSession } from "mongoose";

export class ListService {
  private listModel: listModelType;
  private pageModel: pageModelType;
  private templateModel: templateModelType;
  constructor(
    listModel: listModelType,
    pageModel: pageModelType,
    templateModel: templateModelType
  ) {
    this.listModel = listModel;
    this.pageModel = pageModel;
    this.templateModel = templateModel;
  }
  async findList(channelId: number): Promise<ListInterface> {
    const list = await this.listModel.findOne({ channelId });
    const listId = list._id;
    const listPage = await this.listModel.findOne({ _id: listId }).populate({
      path: "EditablePage.page EditablePage.template SocketPage.page",
      select: "pageName type categories pageName",
    });

    return listPage;
  }

  async updateList(
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

  async deleteListPage(
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

  async deleteListTemplate(
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

  async deleteListSocket(
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

  async deleteList(channelId: number): Promise<list> {
    const list = await this.listModel.findOne({ channelId });
    if (!list) {
      throw new Error("채널이 없습니다.");
    }
    const _id = list._id;
    await this.pageModel.deleteMany({ channelId });
    await this.templateModel.deleteMany({ channelId });
    return this.listModel.findByIdAndDelete({ _id });
  }
}

export const listService = new ListService(listModel, pageModel, templateModel);
