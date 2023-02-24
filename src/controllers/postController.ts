import { postService } from "../services";
import { block, page } from "../interface";
import { AsyncRequestHandler } from "../types";

interface IPostController {
  createPost: AsyncRequestHandler;
  pushPost: AsyncRequestHandler;
  findPost: AsyncRequestHandler;
  deletePost: AsyncRequestHandler;
}

export class PostController implements IPostController {
  findPost: AsyncRequestHandler = async (req, res) => {
    const id = req.params.id;
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const findPost = await postService.findPost(channelId, id);
    res.json(findPost);
  };

  createPost: AsyncRequestHandler = async (req, res) => {
    const { tag, html, imgUrl } = req.body.blocks[0];
    const postName = req.body.postName;
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);

    const block: block = {
      tag: tag,
      html: html,
      imgUrl: imgUrl,
    };
    const page: page = {
      channelId: channelId,
      postName: postName,
      blocks: block,
    };

    const createPost = await postService.createPost(page);
    res.json(createPost);
  };

  pushPost: AsyncRequestHandler = async (req, res) => {
    const id = req.params.id;
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const { label, blocks, postName } = req.body;
    const page: page = {
      channelId: channelId,
      postName: postName,
      label: label,
      blocks: blocks,
    };

    const pushPost = await postService.pushPost(id, page);

    res.json(pushPost);
  };

  deletePost: AsyncRequestHandler = async (req, res) => {
    const id = req.params.id;
    const deletePost = await postService.deletePost(id);
    res.json(deletePost);
  };
}

export const postController = new PostController();
