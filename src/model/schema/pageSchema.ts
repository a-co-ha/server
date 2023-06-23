import mongoose from "mongoose";
import {
  PAGE_BLOCK,
  PAGE_NAME,
  PAGE_TYPE,
  TEMPLATE_STATUS,
} from "../../constants";
import moment from "moment-timezone";
import { PageInterface } from "../../interface";
const Schema = mongoose.Schema;

export const PageSchema = new Schema<PageInterface>(
  {
    channelId: { type: Number, required: true },
    pageName: { type: String, required: false, default: PAGE_NAME.DEFAULT },
    label: [
      {
        githubImg: { type: String, required: false },
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
          default: PAGE_BLOCK.TAG_DEFAULT,
        },
        html: {
          type: String,
          required: false,
          default: PAGE_BLOCK.DEFAULT,
        },
        imgUrl: {
          type: String,
          required: false,
          default: PAGE_BLOCK.DEFAULT,
        },
      },
    ],
    type: {
      type: String,
      default: PAGE_TYPE.NORMAL,
    },
    progressStatus: {
      type: String,
      default: TEMPLATE_STATUS.DEFAULT,
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

PageSchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret) => {
    ret.createdAt = moment(ret.createdAt)
      .tz("Asia/Seoul")
      .format("YYYY-MM-DD HH:mm:ss");
    ret.updatedAt = moment(ret.updatedAt)
      .tz("Asia/Seoul")
      .format("YYYY-MM-DD HH:mm:ss");
  },
});
export { PageInterface };
