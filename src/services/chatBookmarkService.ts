import {
  chatBookmarkModel,
  chatBookmarkModelType,
  bookmarkListModel,
} from "../model";
import { IChatBookmarkModel, bookmarkInfo } from "../interface";
import { bookmarkListService } from "./bookmarkListService";

class ChatBookmarkService implements IChatBookmarkModel {
  private chatBookmarkModel: chatBookmarkModelType;
  constructor(chatBookmarkModel: chatBookmarkModelType) {
    this.chatBookmarkModel = chatBookmarkModel;
  }

  async createBookmark(bookmarkInfo: bookmarkInfo): Promise<bookmarkInfo> {
    const { channelId } = bookmarkInfo;
    const bookmarkList = await bookmarkListModel.findOne({ channelId });
    if (!bookmarkList) {
      throw new Error("채널이 없습니다.");
    }
    const bookmark = await this.chatBookmarkModel.create(bookmarkInfo);
    await bookmarkListService.pushBookmark(channelId, bookmark);
    return bookmark;
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

export const chatBookmarkService = new ChatBookmarkService(chatBookmarkModel);
