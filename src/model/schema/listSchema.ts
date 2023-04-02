import { PageInterface } from "./pageSchema";
import { TemplateInterface } from "./templateSchema";
import mongoose from "mongoose";
import { template } from "../../interface/index";

const Schema = mongoose.Schema;
export interface ListInterface {
  channelId: number;
  ListPage: [
    { page: PageInterface; _id: string },
    { template: TemplateInterface; _id: string }
  ];
}

export const ListSchema = new Schema<ListInterface>({
  channelId: {
    type: Number,
    required: true,
  },
  ListPage: [
    {
      page: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "page",
      },
      template: { type: mongoose.Schema.Types.ObjectId, ref: "template" },
    },
  ],
});
