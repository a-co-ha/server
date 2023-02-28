import { progressModel, postModel } from "../model";
import {
  IProgressModel,
  progress,
  addProgress,
  postStatusUpdate,
} from "../interface";

class ProgressService {
  private progressModel;
  constructor(progressModel: IProgressModel) {
    this.progressModel = progressModel;
  }

  async createProgress(channelId: number): Promise<progress> {
    const page = await postModel.createPost(channelId);

    const progress: progress = {
      channelId: channelId,
      pages: page,
    };

    return await progressModel.createProgress(progress);
  }

  async findProgress(channelId: number, id: string): Promise<progress> {
    return await progressModel.findProgress(channelId, id);
  }

  async addProgress(
    channelId: number,
    id: string,
    progressStatus: string
  ): Promise<progress> {
    const post = await postModel.createPost(channelId, progressStatus);
    const addProgress: addProgress = {
      channelId,
      id,
      pages: post,
    };
    return await progressModel.addProgress(addProgress);
  }

  async updateProgress(
    channelId: number,
    id: string,
    pages: [postStatusUpdate]
  ): Promise<progress> {
    pages.map((a) => {
      if (a.progressStatus) {
        return postModel.postStatusUpdate(a._id, a.progressStatus);
      }
    });

    return await progressModel.updateProgress(channelId, id, pages);
  }
  async deleteProgress(id: string): Promise<object> {
    return await progressModel.deleteProgress(id);
  }
}

const progressService = new ProgressService(progressModel);
export { progressService };
