import { PageInterface } from "./pageSchema";
import { TemplateInterface } from "./templateSchema";
import mongoose from "mongoose";

const Schema = mongoose.Schema;
export interface SocketInterface {
  channelId: number;
  roomName: string;
  type: string;
  categories: string;
}
export const socketSchema = new Schema<SocketInterface>(
  {
    channelId: { type: Number, required: true },
    roomName: { type: String, default: "DefaultRoom" },
    type: { type: String, default: "socket" },
    categories: {
      type: String,
      default: "socket",
    },
  },
  {
    timestamps: true,
  }
);
export interface ListInterface {
  channelId: number;
  ListPage: [
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
  ListPage: [
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
      room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "socket",
      },
    },
  ],
});
