import { BookmarkInterface } from "../interface";

export interface Room {
  id: string;
  readUser: UserOfRoom[] | number[];
}

export interface UserOfRoom {
  userID: number;
}

export interface SocketInterface {
  channelId: number;
  pageName: string;
  type: string;
  categories: string;
  bookmarkList: BookmarkInterface;
  readUser: number[];
  unreadCount: number;
}
