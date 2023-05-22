import { Schema } from "mongoose";
import { PAGE_NAME, PAGE_TYPE } from "../../constants";
import { SocketInterface } from "../../interface";
import { BookmarkSchema } from "../schema";

export const socketSchema = new Schema<SocketInterface>(
  {
    channelId: { type: Number, required: true },

    pageName: { type: String, default: PAGE_NAME.DEFAULT },
    type: { type: String, default: PAGE_TYPE.SOCKET },
    categories: {
      type: String,
      default: PAGE_TYPE.SOCKET,
    },
    bookmarkList: [
      {
        type: BookmarkSchema,
      },
    ],
  },
  {
    timestamps: true,
  }
);
