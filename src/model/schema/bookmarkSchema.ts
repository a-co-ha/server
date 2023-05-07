import mongoose from "mongoose";
import { PAGE_NAME } from "../../constants";
import { BookmarkInterface } from "../../interface/bookmarkInterface";
const Schema = mongoose.Schema;

export const BookmarkSchema = new Schema<BookmarkInterface>(
  {
    bookmarkName: {
      type: String,
      required: false,
      default: PAGE_NAME.DEFAULT,
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
