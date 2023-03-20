import { PageInterface } from "./pageSchema";
import { TemplateInterface } from "./templateSchema";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface ListInterface {
  channelId: number;
  ListPage: PageInterface[];
  ListTemplate: TemplateInterface[];
}

export const ListSchema = new Schema<ListInterface>({
  channelId: {
    type: Number,
    required: true,
  },
  ListPage: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "page",
    },
  ],
  ListTemplate: [{ type: mongoose.Schema.Types.ObjectId, ref: "template" }],
});
