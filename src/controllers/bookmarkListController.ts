import { bookmarkListService } from "../services";
import { AsyncRequestHandler } from "../types";

interface IBookmarkListController {
  createList: AsyncRequestHandler;
}

export class BookmarkListController implements IBookmarkListController {
  createList: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const bookmarkList = await bookmarkListService.createList(channelId);
    res.json(bookmarkList);
  };
}

export const bookmarkListController = new BookmarkListController();
