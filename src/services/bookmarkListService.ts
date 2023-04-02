import {
  bookmarkListModel,
  bookmarkListModelType,
  chatBookmarkModel,
} from "../model";

import { bookmarkInfo, IBookmarkListModel } from "../interface";
import { BookmarkListInterface } from "../model/schema/bookmarkListSchema";

class BookmarkListService implements IBookmarkListModel {
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

  async createBookmark(
    channelId: number,
    bookmark: bookmarkInfo
  ): Promise<BookmarkListInterface> {
    const pushBookmark = await bookmarkListModel.findOneAndUpdate(
      { channelId },
      { $push: { bookmarkList: bookmark } }
    );
    return pushBookmark;
  }
}

export const bookmarkListService = new BookmarkListService(bookmarkListModel);
