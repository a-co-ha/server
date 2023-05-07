import { PageInterface, PageSchema } from "./pageSchema";
import mongoose from "mongoose";
import { PAGE_NAME, PAGE_TYPE } from "../../constants";

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
      default: PAGE_NAME.DEFAULT,
    },
    pages: [{ type: mongoose.Schema.Types.ObjectId, ref: PAGE_TYPE.PAGE }],

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
