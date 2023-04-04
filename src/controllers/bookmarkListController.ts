import { json } from "sequelize";
import { bookmarkListService } from "../services";
import { AsyncRequestHandler } from "../constants";
interface IBookmarkListController {
  createList: AsyncRequestHandler;
  findBookmarkLsit: AsyncRequestHandler;
  updateBookmarkList: AsyncRequestHandler;
  deleteBookmarkList: AsyncRequestHandler;
}

export class BookmarkListController implements IBookmarkListController {
  createList: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const bookmarkList = await bookmarkListService.createList(channelId);
    res.json(bookmarkList);
  };

  findBookmarkLsit: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const findBookmarkList = await bookmarkListService.findBookmarkList(
      channelId
    );
    res.json(findBookmarkList);
  };

  updateBookmarkList: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const bookmark = req.body.bookmarkList;
    const updateBookmarkList = await bookmarkListService.updateBookmarkList(
      channelId,
      bookmark
    );
    res.json(updateBookmarkList);
  };

  deleteBookmarkList: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const deleteBookmarkList = await bookmarkListService.deleteBookmarkList(
      channelId
    );
    res.json(deleteBookmarkList);
  };
}

export const bookmarkListController = new BookmarkListController();
