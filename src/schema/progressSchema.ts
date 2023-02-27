import mongoose from "mongoose";

const Schema = mongoose.Schema;

const progressSchema = new Schema(
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

export { progressSchema };
