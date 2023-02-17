import { postModel } from "../model";
import { post, IPostModel, block } from "../interface";

class PostService {
  private postModel;
  constructor(postModel: IPostModel) {
    this.postModel = postModel;
  }

  async findPost(id: string): Promise<post> {
    return await postModel.findPost(id);
  }

  async findPostBlock(id: string, blockId: string): Promise<post> {
    return await postModel.findPostBlock(id, blockId);
  }

  async createPost(post: post): Promise<post> {
    return await postModel.createPost(post);
  }

  async pushPost(id: string, blocks: block): Promise<post> {
    return await postModel.pushPost(id, blocks);
  }

  async deletePost(id: string): Promise<object> {
    return await postModel.deletePost(id);
  }
}

const postService = new PostService(postModel);

export { postService };
