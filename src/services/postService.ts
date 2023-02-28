import { postModel } from "../model";
import { IPostModel, block, page } from "../interface";

class PostService {
  private postModel;
  constructor(postModel: IPostModel) {
    this.postModel = postModel;
  }

  async findPost(channelId: number, id: string): Promise<page> {
    return await postModel.findPost(channelId, id);
  }

  async createPost(channelId: number): Promise<page> {
    return await postModel.createPost(channelId);
  }

  async pushPost(id: string, page: page): Promise<page> {
    return await postModel.pushPost(id, page);
  }

  async deletePost(id: string): Promise<object> {
    return await postModel.deletePost(id);
  }
}

const postService = new PostService(postModel);

export { postService };
