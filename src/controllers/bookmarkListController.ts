import { json } from "sequelize";
import { bookmarkListService } from "../services";
import { AsyncRequestHandler } from "../constants";
interface IBookmarkListController {
  findBookmarkList: AsyncRequestHandler;
  updateBookmarkList: AsyncRequestHandler;
}

export class BookmarkListController implements IBookmarkListController {
  findBookmarkList: AsyncRequestHandler = async (req, res) => {
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
}

export const bookmarkListController = new BookmarkListController();
