import { postSchema } from "../schema";
import { IPostModel, block, page } from "../interface";
import { model } from "mongoose";
import mongoose from "mongoose";
mongoose.set("strictQuery", true);

const Posts = model("posts", postSchema);

export class PostModel implements IPostModel {
  async findPost(channelId: number, id: string): Promise<page> {
    const post = Posts.findOne({ _id: id });
    return await post.findOne({ channelId });
  }

  async createPost(channelId: number, progressStatus?: string): Promise<page> {
    const blocks: block = {
      tag: "p",
      html: "",
      imgUrl: "",
    };
    const post = await Posts.create({ channelId, blocks, progressStatus });

    return post;
  }

  async pushPost(id: string, page: page): Promise<page> {
    const { channelId, label, pageName, blocks } = page;
    return await Posts.findOneAndUpdate(
      { _id: id },
      {
        pageName: pageName,
        label: label,
        blocks: blocks,
      }
    ).then(() => {
      return this.findPost(channelId, id);
    });
  }

  async postStatusUpdate(id: string, progressStatus: string): Promise<page> {
    return await Posts.findByIdAndUpdate({ _id: id }, { progressStatus });
  }

  async deletePost(id: string): Promise<object> {
    return await Posts.deleteOne({ _id: id });
  }
}

export const postModel = new PostModel();
