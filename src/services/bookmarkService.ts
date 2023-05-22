import { ObjectId } from "mongodb";
import { socketModel, socketModelType } from "../model";
import { logger, RedisHandler } from "../utils";
import { BookmarkInterface } from "../interface";
import { ERROR_NAME } from "../constants";

export class BookmarkService {
  constructor(private socketModel: socketModelType) {}

  public async createBookmark(
    bookmarkInfo: BookmarkInterface
  ): Promise<BookmarkInterface> {
    const { roomId } = bookmarkInfo;
    try {
      const updatedBookmarkList = await socketModel.findOneAndUpdate(
        { _id: new ObjectId(roomId) },
        { $push: { bookmarkList: bookmarkInfo } }
      );

      if (!updatedBookmarkList) {
        throw new Error(ERROR_NAME.NOT_FOUND_CHANNEL);
      }

      await RedisHandler.saveBookmark(bookmarkInfo);
      const list = await this.findBookmarkByRoomId(roomId);

      return list.bookmarkList[list.bookmarkList.length - 1];
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  public async findBookmarkByRoomId(
    id: string
  ): Promise<{ bookmarkList: BookmarkInterface[] }> {
    return await socketModel.findById(
      {
        _id: new ObjectId(id),
      },
      { bookmarkList: 1 }
    );
  }

  public async findBookmarkByBookmarkId(id: string): Promise<any> {
    return await socketModel.aggregate([
      { $unwind: "$bookmarkList" },
      {
        $match: { "bookmarkList._id": new ObjectId(id) },
      },
    ]);
  }

  public async updateBookmark(
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

  public async deleteBookmark(id: string): Promise<any> {
    return await socketModel.updateOne(
      {
        "bookmarkList._id": new ObjectId(id),
      },
      { $pull: { bookmarkList: { _id: new ObjectId(id) } } }
    );
  }

  public async findBookmarkList(roomId: string): Promise<any> {
    return await socketModel.findById(
      { _id: new ObjectId(roomId) },
      { bookmarkList: 1 }
    );
  }
  public async updateBookmarkList(
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
