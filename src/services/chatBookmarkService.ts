import { socketModel, socketModelType } from "./../model/index";
import {
  chatBookmarkModel,
  chatBookmarkModelType,
  bookmarkListModel,
} from "../model";
import { IChatBookmarkModel, bookmarkInfo } from "../interface";
import { bookmarkListService } from "./bookmarkListService";
import redisCache from "../utils/redisCache";

class ChatBookmarkService implements IChatBookmarkModel {
  constructor(private socketModel: socketModelType) {}

  async createBookmark(bookmarkInfo: bookmarkInfo): Promise<any> {
    const { roomId } = bookmarkInfo;

    const bookmarkList = await socketModel.findOneAndUpdate(
      { _id: roomId },
      { bookmarkList: bookmarkInfo }
    );

    if (!bookmarkList) {
      throw new Error("채널이 없습니다.");
    }

    await redisCache.saveBookmark(bookmarkInfo);

    return bookmarkInfo;
  }

  async findBookmark(id: string, channelId: number): Promise<bookmarkInfo> {
    return await chatBookmarkModel.findOne({ _id: id, channelId });
  }

  async updateBookmark(
    id: string,
    bookmarkInfo: bookmarkInfo
  ): Promise<bookmarkInfo> {
    const { channelId, bookmarkName, content, userId, userName } = bookmarkInfo;
    return await chatBookmarkModel.findOneAndUpdate(
      { _id: id, channelId },
      { bookmarkName, content, userId, userName },
      { new: true }
    );
  }

  async deleteBookmark(id: string, channelId: number): Promise<any> {
    return await chatBookmarkModel.findOneAndDelete({ _id: id, channelId });
  }
}

export const chatBookmarkService = new ChatBookmarkService(
  chatBookmarkModel,
  socketModel
);
