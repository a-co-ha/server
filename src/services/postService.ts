import { postModel, postModelType } from "../model";
import { IPostModel, block, page } from "../interface";

// class PostService {
//   private postModel;
//   constructor(postModel: IPostModel) {
//     this.postModel = postModel;
//   }

//   async findPost(channelId: number, id: string): Promise<page> {
//     return await postModel.findPost(channelId, id);
//   }

//   async createPost(channelId: number): Promise<page> {
//     return await postModel.createPost(channelId);
//   }

//   async pushPost(id: string, page: page): Promise<page> {
//     return await postModel.pushPost(id, page);
//   }

//   async deletePost(id: string): Promise<object> {
//     return await postModel.deletePost(id);
//   }
// }

// const postService = new PostService(postModel);

// export { postService };

class PostService implements IPostModel {
  private postModel: postModelType;
  constructor(postModel: postModelType) {
    this.postModel = postModel;
  }

  async findPost(channelId: number, id: string): Promise<page> {
    const post = this.postModel.findOne({ _id: id });
    return await post.findOne({ channelId });
  }

  async createPost(channelId: number, progressStatus?: string): Promise<page> {
    const blocks: block = {
      tag: "p",
      html: "",
      imgUrl: "",
    };
    const post = await this.postModel.create({
      channelId,
      blocks,
      progressStatus,
    });

    return post;
  }

  async pushPost(id: string, page: page): Promise<page> {
    const { channelId, label, pageName, blocks } = page;
    return await this.postModel
      .findOneAndUpdate(
        { _id: id },
        {
          pageName: pageName,
          label: label,
          blocks: blocks,
        }
      )
      .then(() => {
        return this.findPost(channelId, id);
      });
  }

  async postStatusUpdate(id: string, progressStatus: string): Promise<page> {
    return await this.postModel.findByIdAndUpdate(
      { _id: id },
      { progressStatus }
    );
  }

  async deletePost(id: string): Promise<object> {
    return await this.postModel.deleteOne({ _id: id });
  }
}

export const postService = new PostService(postModel);
