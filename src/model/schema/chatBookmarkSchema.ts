import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface ChatBookmarkInterface {
  bookmarkName: string;
  content: string;
  userId: number;
  name: string;
}

export const ChatBookmarkSchema = new Schema<ChatBookmarkInterface>(
  {
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
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
