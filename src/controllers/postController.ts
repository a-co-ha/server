import { postService, progressService } from "../services";
import { block, page } from "../interface";
import { AsyncRequestHandler } from "../types";
import { deleteImage } from "../middlewares";

interface IPostController {
  createPost: AsyncRequestHandler;
  pushPost: AsyncRequestHandler;
  findPost: AsyncRequestHandler;
  deletePost: AsyncRequestHandler;
  findPageList: AsyncRequestHandler;
  imageDelete: AsyncRequestHandler;
  imageUpload: AsyncRequestHandler;
}

export class PostController implements IPostController {
  findPost: AsyncRequestHandler = async (req, res) => {
    const id = req.params.id;
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const type = req.query.type;
    if (type === "normal" || type === "progress-normal") {
      const findPost = await postService.findPost(channelId, id);
      res.json(findPost);
    }
    if (type === "progress") {
      const findProgress = await progressService.findProgress(channelId, id);
      res.json(findProgress);
    }
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
    // const id = req.params.id;
    // const channel = req.query.channel as string;
    // const channelId = parseInt(channel);
    const file = {
      // _id: id,
      // channelId: channelId,
      filePath: req.file.location,
    };

    res.json(file);
  };

  imageDelete: AsyncRequestHandler = async (req, res) => {
    const deleteImageKey = req.body.imgKey;
    const fileKey = deleteImageKey.split("/").pop().split("?")[0];
    const deleteImg = await deleteImage(fileKey);
    res.json(deleteImg);
  };

  findPageList: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const findPageList = await postService.findPageList(channelId);
    res.json(findPageList);
  };
}

export const postController = new PostController();
