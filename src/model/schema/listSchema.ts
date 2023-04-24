import { bookmarkInfo } from "./../../interface/index";
import { PageInterface } from "./pageSchema";
import { TemplateInterface } from "./templateSchema";
import mongoose from "mongoose";
import { BookmarkInterface, BookmarkSchema } from "./bookmarkSchema";

const Schema = mongoose.Schema;
export interface SocketInterface {
  channelId: number;
  pageName: string;
  type: string;
  categories: string;
  bookmarkList: BookmarkInterface;
}
export const socketSchema = new Schema<SocketInterface>(
  {
    channelId: { type: Number, required: true },

    pageName: { type: String, default: "제목 없음" },
    type: { type: String, default: "socket" },
    categories: {
      type: String,
      default: "socket",
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
export interface ListInterface {
  channelId: number;
  EditablePage: [
    { page: PageInterface; _id: string },
    { template: TemplateInterface; _id: string }
  ];
  SocketPage: [];
}

export const ListSchema = new Schema<ListInterface>({
  channelId: {
    type: Number,
    required: true,
  },
  EditablePage: [
    {
      page: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "page",
      },
      template: { type: mongoose.Schema.Types.ObjectId, ref: "template" },
    },
  ],
  SocketPage: [
    {
      page: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "socket",
      },
    },
  ],
});
