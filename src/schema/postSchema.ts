import mongoose from "mongoose";

const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    channelId: { type: Number, required: true },
    postName: { type: String, required: false, default: "제목 없음" },
    label: [
      {
        content: { type: String, required: false, default: "" },
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
  },
  {
    timestamps: true,
  }
);

export { postSchema };
