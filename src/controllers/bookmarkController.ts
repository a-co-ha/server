import { bookmarkInfo } from "../interface";
import { bookmarkService } from "../services";
import { AsyncRequestHandler } from "../utils";

interface IChatBookmarkController {
  findBookmark: AsyncRequestHandler;
}

export class BookmarkController implements IChatBookmarkController {
  findBookmark: AsyncRequestHandler = async (req, res) => {
    const id = req.params.bookmarkId;
    const findBookmark = await bookmarkService.findBookmark(id);
    res.json(findBookmark);
  };

  updateBookmark: AsyncRequestHandler = async (req, res) => {
    const id = req.params.bookmarkId;

    const { bookmarkName, content } = req.body;
    const { userId, name } = req.user;
    const bookmarkInfo: bookmarkInfo = {
      roomId: id,
      bookmarkName,
      content,
      userId,
      userName: name,
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
