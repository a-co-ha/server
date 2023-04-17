import {
  bookmarkListModel,
  bookmarkListModelType,
  chatBookmarkModel,
} from "../model";

import { bookmarkInfo, IBookmarkListModel } from "../interface";
import { BookmarkListInterface } from "../model/schema/bookmarkListSchema";

export class BookmarkListService implements IBookmarkListModel {
  private bookmarkListModel: bookmarkListModelType;
  constructor(bookmarkListModel: bookmarkListModelType) {
    this.bookmarkListModel = bookmarkListModel;
  }

  async createList(channelId: number): Promise<BookmarkListInterface> {
    const findList = await bookmarkListModel.findOne({ channelId });
    if (findList) {
      throw new Error("중복 에러");
    }
    return await bookmarkListModel.create({ channelId });
  }

  async pushBookmark(
    channelId: number,
    bookmark: bookmarkInfo
  ): Promise<BookmarkListInterface> {
    const pushBookmark = await bookmarkListModel.findOneAndUpdate(
      { channelId },
      { $push: { bookmarkList: bookmark } }
    );
    return pushBookmark;
  }

  async findBookmarkList(channelId: number): Promise<BookmarkListInterface> {
    return await (
      await bookmarkListModel.findOne({ channelId })
    ).populate({
      path: "bookmarkList",
      select: "bookmarkName content userName ",
    });
  }
  async updateBookmarkList(
    channelId: number,
    bookmark: bookmarkInfo[]
  ): Promise<BookmarkListInterface> {
    return await this.bookmarkListModel
      .findOneAndUpdate({ channelId }, { bookmarkList: bookmark })
      .then(() => this.findBookmarkList(channelId));
  }
  async deleteBookmarkList(channelId: number): Promise<BookmarkListInterface> {
    await chatBookmarkModel.deleteMany({ channelId });
    return await bookmarkListModel.findOneAndDelete({ channelId });
  }
}

export const bookmarkListService = new BookmarkListService(bookmarkListModel);
