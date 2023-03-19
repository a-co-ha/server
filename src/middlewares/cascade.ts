import { pageModel, templateModel } from "../model";
import { Request, Response, NextFunction } from "express";

export const cascade = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  try {
    const findProgress = await templateModel.findById({ _id: id });
    const progressPages = findProgress.pages;
    progressPages.map(async (page) => {
      await pageModel.deleteOne({ _id: page });
    });
    next();
  } catch (err) {
    next(err);
  }
};
