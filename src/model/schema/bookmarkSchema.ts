import mongoose from "mongoose";
import { BookmarkInterface } from "../../interface/bookmarkInterface";
const Schema = mongoose.Schema;

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
