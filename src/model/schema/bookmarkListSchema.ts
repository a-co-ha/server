import { ChatBookmarkInterface } from "./chatBookmarkSchema";
import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface BookmarkListInterface {
  channelId: number;
  bookmarkList: ChatBookmarkInterface;
}

export const bookmarkListSchema = new Schema<BookmarkListInterface>({
  channelId: {
    type: Number,
    required: true,
  },
  bookmarkList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chatBookmark",
    },
  ],
});
