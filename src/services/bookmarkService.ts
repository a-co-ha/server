import { ObjectId } from "mongodb";
import { socketModel, socketModelType } from "../model";
import { IChatBookmarkModel } from "../interface";
import { logger, RedisHandler } from "../utils";
import { BookmarkInterface } from "../interface/bookmarkInterface";

export class BookmarkService implements IChatBookmarkModel {
  constructor(private socketModel: socketModelType) {}

  async createBookmark(
    bookmarkInfo: BookmarkInterface
  ): Promise<BookmarkInterface> {
    const { roomId } = bookmarkInfo;
    try {
      const updatedBookmarkList = await socketModel.findOneAndUpdate(
        { _id: new ObjectId(roomId) },
        { $push: { bookmarkList: bookmarkInfo } }
      );

      if (!updatedBookmarkList) {
        throw Error("채널이 없습니다.");
      }

      await RedisHandler.saveBookmark(bookmarkInfo);
      const list = await this.findBookmarkByRoomId(roomId);

      return list.bookmarkList[list.bookmarkList.length - 1];
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  async findBookmarkByRoomId(
    id: string
  ): Promise<{ bookmarkList: BookmarkInterface[] }> {
    return await socketModel.findById(
      {
        _id: new ObjectId(id),
      },
      { bookmarkList: 1 }
    );
  }

  async findBookmarkByBookmarkId(id: string): Promise<any> {
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
      {
        "bookmarkList._id": new ObjectId(id),
      },
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
