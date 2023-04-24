import moment from "moment-timezone";
import { BookmarkInterface } from "../model/schema/bookmarkSchema";
import { bookmarkService } from "../services";
import { AsyncRequestHandler, getCurrentDate } from "../utils";

interface IChatBookmarkController {
  findBookmark: AsyncRequestHandler;
}

export class BookmarkController implements IChatBookmarkController {
  findBookmark: AsyncRequestHandler = async (req, res) => {
    const id = req.params.bookmarkId;
    const bookmarkList = await bookmarkService.findBookmark(id);
    res.json(...bookmarkList);
  };

  updateBookmark: AsyncRequestHandler = async (req, res) => {
    const id = req.params.bookmarkId;
    const updatedAt = moment(getCurrentDate()).format("YYYY-MM-DD HH:mm:ss");
    const { bookmarkName, content } = req.body;
    const { userId, name } = req.user;
    const bookmarkInfo: BookmarkInterface = {
      roomId: id,
      bookmarkName,
      content,
      userId,
      name,
      updatedAt,
    };
    const updateBookmark = await bookmarkService.updateBookmark(
      id,
      bookmarkInfo
    );
    res.json(updateBookmark);
  };

  deleteBookmark: AsyncRequestHandler = async (req, res) => {
    const id = req.params.bookmarkId;
    const deleteBookmark = await bookmarkService.deleteBookmark(id);
    res.json(deleteBookmark);
  };

  getBookmarkList: AsyncRequestHandler = async (req, res) => {
    const room = req.params.roomId;

    const findBookmarkList = await bookmarkService.findBookmarkList(room);
    res.json(findBookmarkList);
  };

  updateBookmarkList: AsyncRequestHandler = async (req, res) => {
    const room = req.params.roomId;
    const bookmark = req.body.bookmarkList;
    const updateBookmarkList = await bookmarkService.updateBookmarkList(
      room,
      bookmark
    );
    res.json(updateBookmarkList);
  };
}

export const bookmarkController = new BookmarkController();
