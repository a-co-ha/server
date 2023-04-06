import { bookmarkInfo } from "../interface";
import { chatBookmarkService } from "../services";
import { AsyncRequestHandler } from "../constants";

interface IChatBookmarkController {
  createBookmark: AsyncRequestHandler;
  findBookmark: AsyncRequestHandler;
}

export class ChatBookmarkController implements IChatBookmarkController {
  createBookmark: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const { bookmarkName, content } = req.body;
    const { userId, name } = req.user;
    const bookmarkInfo: bookmarkInfo = {
      channelId,
      bookmarkName,
      content,
      userId,
      userName: name,
    };

    const bookmark = await chatBookmarkService.createBookmark(bookmarkInfo);
    res.json(bookmark);
  };

  findBookmark: AsyncRequestHandler = async (req, res) => {
    const id = req.params.id;
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const findBookmark = await chatBookmarkService.findBookmark(id, channelId);
    res.json(findBookmark);
  };

  updateBookmark: AsyncRequestHandler = async (req, res) => {
    const id = req.params.id;
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const { bookmarkName, content } = req.body;
    const { userId, name } = req.user;
    const bookmarkInfo: bookmarkInfo = {
      channelId,
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
    const id = req.params.id;
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const deleteBookmark = await chatBookmarkService.deleteBookmark(
      id,
      channelId
    );
    res.json(deleteBookmark);
  };
}

export const chatBookmarkController = new ChatBookmarkController();
