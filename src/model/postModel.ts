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

  async updatePost(id: string, block: block, blockId: string): Promise<post> {
    const { tag, content, imgUrl } = block;

    return await Posts.findOneAndUpdate(
      { _id: id, blocks: { $elemMatch: { _id: blockId } } },
      {
        $set: {
          "blocks.$": { tag: tag, content: content, imgUrl: imgUrl },
        },
      }
    );
  }

  async pushPost(id: string, block: block): Promise<post> {
    const { tag, content, imgUrl } = block;

    return await Posts.findOneAndUpdate(
      { _id: id },
      {
        $push: {
          blocks: { tag: tag, content: content, imgUrl: imgUrl },
        },
      }
    );
  }

  async deletePost(id: string): Promise<object> {
    return await Posts.deleteOne({ _id: id });
  }
}

export const postModel = new PostModel();
