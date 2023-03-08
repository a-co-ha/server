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
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const blockId = req.body.blockId;
    const createPost = await postService.createPost(channelId, blockId);
    res.json(createPost);
  };

  pushPost: AsyncRequestHandler = async (req, res) => {
    const id = req.params.id;
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const { label, blocks, pageName } = req.body;
    const page: page = {
      channelId: channelId,
      pageName: pageName,
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

  imageUpload: AsyncRequestHandler = async (req, res) => {
    const id = req.params.id;
    const filePath = { filePath: req.file.location };

    res.json(filePath);
  };
}

export const postController = new PostController();
