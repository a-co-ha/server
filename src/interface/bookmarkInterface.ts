import { AsyncRequestHandler } from "../utils";
import { User } from "./userInterface";

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
