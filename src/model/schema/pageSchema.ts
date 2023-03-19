import mongoose from "mongoose";
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
}

export const PageSchema = new Schema<PageInterface>(
  {
    channelId: { type: Number, required: true },
    pageName: { type: String, required: false, default: "제목 없음" },
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
      default: "normal",
    },
    progressStatus: {
      type: String,
      default: "null",
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
