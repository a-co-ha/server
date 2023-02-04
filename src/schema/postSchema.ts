import mongoose from "mongoose";

const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    blocks: [
      {
        tag: {
          type: String,
          required: true,
        },
        html: {
          type: String,
          required: false,
        },
        imageUrl: {
          type: String,
          required: false,
        },
      },
    ],
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export { postSchema };
