import { postSchema } from "../schema";
import { post, IPostModel, block } from "../interface";
import { model } from "mongoose";
import mongoose from "mongoose";
mongoose.set("strictQuery", true);
const Posts = model("posts", postSchema);

export class PostModel implements IPostModel {
  async findPost(id: string): Promise<post> {
    return await Posts.findById({ _id: id });
  }

  async findPostBlock(id: string, blockId: string): Promise<post> {
    return await Posts.findOne(
      { _id: id, blocks: { $elemMatch: { _id: blockId } } },
      { "blocks.$": true }
    );
  }

  async createPost(post: post): Promise<post> {
    return await Posts.create(post);
  }

  async pushPost(id: string, blocks: block): Promise<post> {
    return await Posts.findOneAndUpdate(
      { _id: id },
      {
        blocks: blocks,
      }
    ).then(() => {
      return this.findPost(id);
    });
  }

  async deletePost(id: string): Promise<object> {
    return await Posts.deleteOne({ _id: id });
  }
}

export const postModel = new PostModel();
