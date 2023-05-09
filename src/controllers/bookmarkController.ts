import moment from "moment-timezone";
import { dateFormat } from "../constants";
import { BookmarkInterface, IBookmarkController } from "../interface";
import { BookmarkService, bookmarkService } from "../services";
import { AsyncRequestHandler, getCurrentDate } from "../utils";

export class BookmarkController implements IBookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  public getBookmark: AsyncRequestHandler = async (req, res) => {
    const id = req.body.bookmarkId;
    const bookmarkList = await this.bookmarkService.findBookmarkByBookmarkId(
      id
    );
    res.json(...bookmarkList);
  };

  public updateBookmark: AsyncRequestHandler = async (req, res) => {
    const updatedAt = moment(getCurrentDate()).format(dateFormat);
    const { bookmarkName, content, bookmarkId } = req.body;
    const { userId, name } = req.user;
    const bookmarkInfo: BookmarkInterface = {
      bookmarkName,
      content,
      userId,
      name,
      updatedAt,
    };
    const updateBookmark = await this.bookmarkService.updateBookmark(
      bookmarkId,
      bookmarkInfo
    );
    res.json(updateBookmark);
  };

  public deleteBookmark: AsyncRequestHandler = async (req, res) => {
    const { bookmarkId } = req.body;
    const deleteBookmark = await this.bookmarkService.deleteBookmark(
      bookmarkId
    );
    res.json(deleteBookmark);
  };

  public getBookmarkList: AsyncRequestHandler = async (req, res) => {
    const { roomId } = req.body;
    const findBookmarkList = await this.bookmarkService.findBookmarkList(
      roomId
    );
    res.json(findBookmarkList);
  };

  public updateBookmarkList: AsyncRequestHandler = async (req, res) => {
    const { roomId: room, bookmarkList: bookmark } = req.body.roomId;
    const updateBookmarkList = await this.bookmarkService.updateBookmarkList(
      room,
      bookmark
    );
    res.json(updateBookmarkList);
  };
}

export const bookmarkController = new BookmarkController(bookmarkService);
