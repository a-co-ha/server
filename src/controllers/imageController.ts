import { AsyncRequestHandler } from "../utils";
import { deleteImage } from "../middlewares";

interface IImageController {
  imageDelete: AsyncRequestHandler;
  imageUpload: AsyncRequestHandler;
}

export class ImageController implements IImageController {
  imageUpload: AsyncRequestHandler = async (req, res) => {
    const file = {
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
}

export const imageController = new ImageController();
