import { postModel, progressModel } from "../model";
import { Request, Response, NextFunction } from "express";

export const progressCascade = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  try {
    const findProgress = await progressModel.findById({ _id: id });
    const progressPages = findProgress.pages;
    progressPages.map(async (page) => {
      await postModel.deleteOne({ _id: page });
    });
    next();
  } catch (err) {
    next(err);
  }
};
