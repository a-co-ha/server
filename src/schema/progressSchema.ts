import mongoose from "mongoose";

const Schema = mongoose.Schema;

const progressSchema = new Schema({
  channelId: { type: Number, required: true },
  postName: { type: String, required: true },
  post: [
    {
      page: { type: mongoose.Schema.Types.ObjectId, ref: "posts" },
      progress: { type: String, required: true },
    },
  ],
});

export { progressSchema };
