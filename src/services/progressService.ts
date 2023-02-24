import { progressModel, postModel } from "../model";
import { IProgressModel, progress } from "../interface";

class ProgressService {
  private progressModel;
  constructor(progressModel: IProgressModel) {
    this.progressModel = progressModel;
  }

  async createProgress(
    channelId: number,
    postName: string,
    pageId: string
  ): Promise<progress> {
    return progressModel.createProgress(channelId, postName, pageId);
  }
}
