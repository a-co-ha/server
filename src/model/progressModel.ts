import { progressSchema } from "../schema";
import mongoose from "mongoose";
import { model } from "mongoose";
import { IProgressModel, progress } from "../interface";

mongoose.set("strictQuery", true);

const Progress = model("progress", progressSchema);

export class ProgressModel implements IProgressModel {
  async createProgress(
    channelId: number,
    postName: string,
    pageId: string
  ): Promise<progress> {
    return await (
      await Progress.create({ channelId, postName, pageId })
    ).populate("posts");
  }
}

export const progressModel = new ProgressModel();
