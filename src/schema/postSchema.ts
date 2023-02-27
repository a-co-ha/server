import mongoose from "mongoose";
import { progress } from "../interface/index";

const Schema = mongoose.Schema;

const postSchema = new Schema(
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

export { postSchema };
