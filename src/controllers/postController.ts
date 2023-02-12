import { postService } from "../services";
import { post, block } from "../interface";
import { AsyncRequestHandler } from "../types";

interface IPostController {
  createPost: AsyncRequestHandler;
  pushPost: AsyncRequestHandler;
  findPost: AsyncRequestHandler;
  findPostBlock: AsyncRequestHandler;
  deletePost: AsyncRequestHandler;
}

export class PostController implements IPostController {
  findPost: AsyncRequestHandler = async (req, res) => {
    const id = req.params.id;
    const findPost = await postService.findPost(id);
    res.json(findPost);
  };

  findPostBlock: AsyncRequestHandler = async (req, res) => {
    const id = req.params.id;
    const blockId = req.query.block as string;

    const findPostBlock = await postService.findPostBlock(id, blockId);
    res.json(findPostBlock);
  };

  createPost: AsyncRequestHandler = async (req, res) => {
    const { tag, content, imgUrl } = req.body.blocks[0];

    const block: block = {
      tag: tag,
      content: content,
      imgUrl: imgUrl,
    };
    const post: post = {
      blocks: block,
    };
    const createPost = await postService.createPost(post);
    res.json(createPost);
  };

  pushPost: AsyncRequestHandler = async (req, res) => {
    const id = req.params.id;
    const blockId = req.query.block as string;
    const { tag, content, imgUrl } = req.body.blocks[0];

    const block: block = {
      tag: tag,
      content: content,
      imgUrl: imgUrl,
    };

    const pushPost = await postService.pushPost(id, block, blockId);

    res.json(pushPost);
  };

  deletePost: AsyncRequestHandler = async (req, res) => {
    const id = req.params.id;
    const deletePost = await postService.deletePost(id);
    res.json(deletePost);
  };
}

export const postController = new PostController();
