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

  async createPost(page: page): Promise<page> {
    const post = await Posts.create(page);

    return post;
  }

  async pushPost(id: string, page: page): Promise<page> {
    const { channelId, label, postName, blocks } = page;
    return await Posts.findOneAndUpdate(
      { _id: id },
      {
        postName: postName,
        label: label,
        blocks: blocks,
      }
    ).then(() => {
      return this.findPost(channelId, id);
    });
  }

  async deletePost(id: string): Promise<object> {
    return await Posts.deleteOne({ _id: id });
  }
}

export const postModel = new PostModel();
