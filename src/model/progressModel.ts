import { progressSchema } from "../schema";
import mongoose from "mongoose";
import { model } from "mongoose";
import {
  addProgress,
  IProgressModel,
  progress,
  postStatusUpdate,
} from "../interface";

const Progress = model("progress", progressSchema);

export class ProgressModel implements IProgressModel {
  async createProgress(progress: progress): Promise<progress> {
    const { channelId, pages } = progress;

    return await Progress.create({ channelId, pages });
  }
  async findProgress(channelId: number, id: string): Promise<progress> {
    const progress = Progress.findOne({ _id: id }).populate({
      path: "pages",
      select: "pageName label progressStatus",
    });
    return await progress.findOne({ channelId });
  }
  async addProgress(addProgress: addProgress): Promise<progress> {
    const { channelId, id, pages } = addProgress;
    return Progress.findByIdAndUpdate({ _id: id }, { $push: { pages } }).then(
      () => {
        return this.findProgress(channelId, id);
      }
    );
  }
  async updateProgress(
    channelId: number,
    id: string,
    pages: [postStatusUpdate]
  ): Promise<progress> {
    return await Progress.findByIdAndUpdate({ _id: id }, { pages }).then(() => {
      return this.findProgress(channelId, id);
    });
  }

  async deleteProgress(id: string): Promise<object> {
    return await Progress.deleteOne({ _id: id });
  }
}

export const progressModel = new ProgressModel();
