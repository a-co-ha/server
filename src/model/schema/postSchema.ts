import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface PostInterface {
  channelId: number;
  pageName: string;
  label: string[];
  blocks: [
    {
      tag: string;
      html: string;
      igUrl: string;
    }
  ];
  type: string;
  progressStatus: string;
}

export const PostSchema = new Schema<PostInterface>(
  {
    channelId: { type: Number, required: true },
    pageName: { type: String, required: false, default: "제목 없음" },
    label: [
      {
        content: { type: String, required: false },
      },
    ],
    blocks: [
      {
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
      default: "todo",
    },
  },
  {
    timestamps: true,
  }
);
