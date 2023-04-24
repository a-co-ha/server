import { ObjectId } from "mongodb";
import { socketModel, socketModelType } from "../model";
import { IChatBookmarkModel } from "../interface";
import { logger, getCurrentDate } from "../utils";
import { BookmarkInterface } from "../model/schema/bookmarkSchema";
import redisCache from "../utils/redisCache";
import moment from "moment-timezone";

class BookmarkService implements IChatBookmarkModel {
  constructor(private socketModel: socketModelType) {}

  async createBookmark(bookmarkInfo: BookmarkInterface): Promise<any> {
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
  async updateBookmark(
    id: string,
    bookmarkInfo: BookmarkInterface
  ): Promise<any> {
    const { bookmarkName, content, userId, name } = bookmarkInfo;
    return await socketModel.updateMany(
      {
        "bookmarkList._id": new ObjectId(id),
      },
      {
        $set: {
          "bookmarkList.$.bookmarkName": bookmarkName,
          "bookmarkList.$.content": content,
          "bookmarkList.$.userId": userId,
          "bookmarkList.$.name": name,
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
    bookmark: BookmarkInterface[]
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
