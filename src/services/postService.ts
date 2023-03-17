import { postModel, postModelType } from "../model";
import { IPostModel, block, page } from "../interface";
import { progressModel } from "../model/index";
class PostService implements IPostModel {
  private postModel: postModelType;
  constructor(postModel: postModelType) {
    this.postModel = postModel;
  }

  async findPost(channelId: number, id: string): Promise<page> {
    const post = this.postModel.findOne({ _id: id });
    return await post.findOne({ channelId });
  }

  async createPost(
    channelId: number,
    blockId: string,
    progressStatus?: string,
    type?: string
  ): Promise<page> {
    const blocks: block = {
      blockId: blockId,
      tag: "p",
      html: "",
      imgUrl: "",
    };
    const post = await this.postModel.create({
      channelId,
      blocks,
      progressStatus,
      type,
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

  async findPageList(channelId: number): Promise<any> {
    const findPost = await postModel.aggregate([
      { $match: { channelId: channelId, type: "normal" } },
      {
        $group: {
          _id: "$_id",
          pageName: { $last: "$pageName" },
          type: { $last: "$type" },
        },
      },
    ]);
    const findProgress = await progressModel.aggregate([
      { $match: { channelId: channelId, type: "progress" } },
      {
        $group: {
          _id: "$_id",
          pageName: { $last: "$pageName" },
          type: { $last: "$type" },
        },
      },
    ]);

    const findList = { List: [...findPost, ...findProgress] };
    return findList;
  }
}

export const postService = new PostService(postModel);
