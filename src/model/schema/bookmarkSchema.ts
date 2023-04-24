import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface BookmarkInterface {
  bookmarkName: string;
  content: string;
  userId: number;
  name: string;
  createdAt?: string;
  updatedAt: string;
  roomId: string;
}

export const BookmarkSchema = new Schema<BookmarkInterface>(
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
    createdAt: {
      type: String,
    },
    updatedAt: {
      type: String,
    },
  },
  {
    timestamps: false,
  }
);
