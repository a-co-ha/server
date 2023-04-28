import { PageInterface, PageSchema } from "./pageSchema";
import mongoose from "mongoose";

const Schema = mongoose.Schema;
export interface TemplateInterface {
  id?: string;
  channelId: number;
  pageName: string;
  pages: PageInterface[];
  type: string;
  categories: string;
}
export const TemplateSchema = new Schema<TemplateInterface>(
  {
    channelId: {
      type: Number,
      required: true,
    },
    pageName: {
      type: String,
      required: false,
      default: "제목 없음",
    },
    pages: [{ type: mongoose.Schema.Types.ObjectId, ref: "page" }],

    type: {
      type: String,
      //todo required: true, 로 바꿔야함
      default: "template",
    },
    categories: {
      type: String,
      default: "page",
    },
  },
  {
    timestamps: true,
  }
);
