import { socketModel, socketModelType } from "../model/index";
import { ObjectId } from "mongodb";
import { IChatBookmarkModel, bookmarkInfo } from "../interface";
import redisCache from "../utils/redisCache";
import { logger } from "../utils/winston";

class BookmarkService implements IChatBookmarkModel {
  constructor(private socketModel: socketModelType) {}

  async createBookmark(bookmarkInfo: bookmarkInfo): Promise<any> {
    const { roomId } = bookmarkInfo;
    try {
      const bookmarkList = await socketModel.findOneAndUpdate(
        { _id: roomId },
        { $push: { bookmarkList: bookmarkInfo } }
      );

      if (!bookmarkList) {
        throw Error("채널이 없습니다.");
      }

      await redisCache.saveBookmark(bookmarkInfo);

      return bookmarkInfo;
    } catch (err: any) {
      logger.error(err.message);
      return;
    }
  }

  async findBookmark(id: string): Promise<any> {
    return await socketModel.aggregate([
      { $unwind: "$bookmarkList" },
      {
        $match: { "bookmarkList._id": new ObjectId(id) },
      },
    ]);
  }
  async updateBookmark(id: string, bookmarkInfo: bookmarkInfo): Promise<any> {
    const { bookmarkName, content, userId, userName } = bookmarkInfo;
    return await socketModel.updateMany(
      {
        "bookmarkList._id": new ObjectId(id),
      },
      {
        $set: {
          "bookmarkList.$.bookmarkName": bookmarkName,
          "bookmarkList.$.content": content,
          "bookmarkList.$.userId": userId,
          "bookmarkList.$.userName": userName,
        },
      }
    );
  }

  async deleteBookmark(id: string): Promise<any> {
    return await socketModel.updateOne(
      {},
      { $pull: { bookmarkList: { _id: new ObjectId(id) } } }
    );
  }

  async findBookmarkList(roomId: string): Promise<any> {
    return await socketModel.findById(
      { _id: new ObjectId(roomId) },
      { bookmarkList: 1 }
    );
  }
  async updateBookmarkList(
    roomId: string,
    bookmark: bookmarkInfo[]
  ): Promise<any> {
    return await this.socketModel
      .findOneAndUpdate(
        { _id: new ObjectId(roomId) },
        { bookmarkList: bookmark }
      )
      .then(() => this.findBookmarkList(roomId));
  }
}

export const bookmarkService = new BookmarkService(socketModel);
