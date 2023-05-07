import { Socket } from "socket.io";
import { PageInterface } from "./pageSchema";
import { TemplateInterface } from "./templateSchema";
import mongoose from "mongoose";
import { BookmarkSchema } from "./bookmarkSchema";
import { BookmarkInterface } from "../../interface/bookmarkInterface";
import { ChannelUser } from "../channelUser";
import { PAGE_NAME, PAGE_TYPE } from "../../constants";

const Schema = mongoose.Schema;
export interface SocketInterface {
  channelId: number;
  pageName: string;
  type: string;
  categories: string;
  bookmarkList: BookmarkInterface;
  readUser: number[];
  unreadCount: number;
}
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
        ref: PAGE_TYPE.PAGE,
      },
      template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: PAGE_TYPE.TEMPLATE,
      },
    },
  ],
  SocketPage: [
    {
      page: {
        type: mongoose.Schema.Types.ObjectId,
        ref: PAGE_TYPE.SOCKET,
      },
    },
  ],
});
