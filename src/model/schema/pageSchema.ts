import mongoose from "mongoose";
import { PAGE_NAME, PAGE_TYPE } from "../../constants";
import { TemplateInterface } from "./templateSchema";
const Schema = mongoose.Schema;

export interface PageInterface {
  channelId: number;
  pageName: string;
  label: string[];
  initial: boolean;
  blocks: [
    {
      blockId: string;
      tag: string;
      html: string;
      igUrl: string;
    }
  ];
  type: string;
  progressStatus: string;
  categories: string;
  parentTemplate: TemplateInterface;
}

export const PageSchema = new Schema<PageInterface>(
  {
    channelId: { type: Number, required: true },
    pageName: { type: String, required: false, default: PAGE_NAME.DEFAULT },
    label: [
      {
        content: { type: String, required: false },
      },
    ],
    initial: { type: Boolean, required: false, default: true },
    blocks: [
      {
        blockId: {
          type: String,
          required: true,
        },
        tag: {
          type: String,
          required: true,
          default: "p",
        },
        html: {
          type: String,
          required: false,
          default: "",
        },
        imgUrl: {
          type: String,
          required: false,
          default: "",
        },
      },
    ],
    type: {
      type: String,
      default: PAGE_TYPE.NORMAL,
    },
    progressStatus: {
      type: String,
      default: "null",
    },
    categories: {
      type: String,
      default: PAGE_TYPE.PAGE,
    },
    parentTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: PAGE_TYPE.TEMPLATE,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
