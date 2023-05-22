import mongoose from "mongoose";
import { PAGE_NAME, PAGE_TYPE } from "../../constants";
import { TemplateInterface } from "../../interface";

const Schema = mongoose.Schema;

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
      default: PAGE_TYPE.TEMPLATE,
    },
    categories: {
      type: String,
      default: PAGE_TYPE.PAGE,
    },
  },
  {
    timestamps: true,
  }
);
