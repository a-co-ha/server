import { bookmarkInfo } from "../interface";
import { chatBookmarkService } from "../services";
import { AsyncRequestHandler } from "../constants";

interface IChatBookmarkController {
  findBookmark: AsyncRequestHandler;
}

export class ChatBookmarkController implements IChatBookmarkController {
  findBookmark: AsyncRequestHandler = async (req, res) => {
    const id = req.params.bookmarkId;
    const findBookmark = await chatBookmarkService.findBookmark(id);
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
    const updateBookmark = await chatBookmarkService.updateBookmark(
      id,
      bookmarkInfo
    );
    res.json(updateBookmark);
  };

  deleteBookmark: AsyncRequestHandler = async (req, res) => {
    const id = req.params.bookmarkId;
    const deleteBookmark = await chatBookmarkService.deleteBookmark(id);
    res.json(deleteBookmark);
  };

  getBookmarkList: AsyncRequestHandler = async (req, res) => {
    const room = req.params.roomId;

    const findBookmarkList = await chatBookmarkService.findBookmarkList(room);
    res.json(findBookmarkList);
  };

  updateBookmarkList: AsyncRequestHandler = async (req, res) => {
    const room = req.params.roomId;
    const bookmark = req.body.bookmarkList;
    const updateBookmarkList = await chatBookmarkService.updateBookmarkList(
      room,
      bookmark
    );
    res.json(updateBookmarkList);
  };
}

export const chatBookmarkController = new ChatBookmarkController();
