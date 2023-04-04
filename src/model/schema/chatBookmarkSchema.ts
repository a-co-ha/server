import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface ChatBookmarkInterface {
  channelId: number;
  bookmarkName: string;
  content: string;
  userId: number;
  userName: string;
  type: string;
  categories: string;
}

export const ChatBookmarkSchema = new Schema<ChatBookmarkInterface>(
  {
    channelId: {
      type: Number,
      required: true,
    },
    bookmarkName: {
      type: String,
      required: false,
      default: "제목 없음",
    },
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: Number,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      default: "socket-chat-bookmark",
    },
    categories: {
      type: String,
      required: true,
      default: "socket",
    },
  },
  {
    timestamps: true,
  }
);
