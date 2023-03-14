import multer from "multer";
import { s3keyId, s3accesskey, s3region } from "../config";
import multerS3 from "multer-s3";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";

const s3 = new S3Client({
  region: s3region,
  credentials: {
    accessKeyId: s3keyId,
    secretAccessKey: s3accesskey,
  },
});

const allowedExtensions = [".png", ".jpg", ".jpeg", ".bmp"];

export const imageUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "acoha",
    key: function (req, file, cb) {
      const extension = file.originalname.split(".").pop();
      if (allowedExtensions.includes("." + extension.toLowerCase())) {
        const filename = uuidv4() + "." + extension;
        cb(null, filename);
      } else {
        cb(new Error("Invalid file type"));
      }
    },
  }),
  fileFilter: function (req, file, cb) {
    // check for allowed file types and sizes
    cb(null, true);
  },
});

//todo
export const deleteS3ImageMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.body);
  if (req.body.deleteImageKey) {
    const key = req.body.deleteImageKey;

    deleteImage(key);
  }
  next();
};

const deleteImage = async (key: any) => {
  const command = new DeleteObjectCommand({
    Bucket: "acoha",
    Key: key,
  });

  try {
    await s3.send(command);
    console.log(`File ${key} deleted from S3`);
  } catch (err) {
    console.log(`Error deleting ${key} from S3: ${err}`);
  }
};
