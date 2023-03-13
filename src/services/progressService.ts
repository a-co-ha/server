import { progressModel, progressModelType } from "../model";
import { postService } from "./postService";
import { IProgressModel, progress, postStatusUpdate } from "../interface";

class ProgressService implements IProgressModel {
  private progressModel: progressModelType;
  constructor(progressModel: progressModelType) {
    this.progressModel = progressModel;
  }

  async createProgress(channelId: number, blockId: string): Promise<progress> {
    const pages = await postService.createPost(channelId, blockId);
    return await this.progressModel.create({ channelId, pages });
  }

  async findProgress(channelId: number, id: string): Promise<progress> {
    const progress = progressModel.findOne({ _id: id }).populate({
      path: "pages",
      select: "pageName label progressStatus",
    });
    return await progress.findOne({ channelId });
  }

  async addProgress(
    channelId: number,
    id: string,
    blockId: string,
    progressStatus: string
  ): Promise<progress> {
    const pages = await postService.createPost(
      channelId,
      blockId,
      progressStatus
    );
    return this.progressModel
      .findByIdAndUpdate({ _id: id }, { $push: { pages } })
      .then(() => {
        return this.findProgress(channelId, id);
      });
  }
  async updateProgress(
    channelId: number,
    id: string,
    pages: [postStatusUpdate]
  ): Promise<progress> {
    pages.map((page) => {
      if (page.progressStatus) {
        return postService.postStatusUpdate(page._id, page.progressStatus);
      }
    });
    return await this.progressModel
      .findByIdAndUpdate({ _id: id }, { pages })
      .then(() => {
        return this.findProgress(channelId, id);
      });
  }

  async deleteProgress(id: string): Promise<object> {
    return await progressModel.deleteOne({ _id: id });
  }

  async percentageProgress(id: string): Promise<object> {
    const progress = progressModel.findOne({ _id: id }).populate({
      path: "pages",
      select: "progressStatus",
    });

    const progressPages = (await progress).pages;
    const length = progressPages.length;
    let count = 0;
    progressPages.map((page) => {
      if (page.progressStatus === "complete") {
        count++;
      }
    });
    const percentage = Math.floor((count / length) * 100);
    const progressPercentage = {
      percentage,
    };
    return progressPercentage;
  }
}

export const progressService = new ProgressService(progressModel);
