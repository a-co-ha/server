import { User } from "../interface";
import { AsyncRequestHandler } from "../utils";

export interface IBookmarkController {
  getBookmark: AsyncRequestHandler;
  updateBookmark: AsyncRequestHandler;
  getBookmarkList: AsyncRequestHandler;
  deleteBookmark: AsyncRequestHandler;
  updateBookmarkList: AsyncRequestHandler;
}

export interface BookmarkInterface extends User {
  bookmarkName: string;
  content: string;
  createdAt?: string;
  updatedAt: string;
  roomId?: string;
}
