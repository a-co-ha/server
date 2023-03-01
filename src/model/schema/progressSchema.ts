import { PostInterface, PostSchema } from "./postSchema";
import mongoose from "mongoose";

const Schema = mongoose.Schema;
export interface ProgressInterface {
  channelId: number;
  pageName: string;
  pages: PostInterface[];
  type: string;
}
export const ProgressSchema = new Schema<ProgressInterface>(
  {
    channelId: {
      type: Number,
      required: true,
    },
    pageName: {
      type: String,
      required: false,
      default: "진행현황",
    },
    pages: [{ type: mongoose.Schema.Types.ObjectId, ref: "posts" }],

    type: {
      type: String,
      default: "progress",
    },
  },
  {
    timestamps: true,
  }
);
