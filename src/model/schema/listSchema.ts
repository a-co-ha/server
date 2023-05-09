import mongoose from "mongoose";

import { ListInterface } from "../../interface";
import { PAGE_TYPE } from "../../constants";

const Schema = mongoose.Schema;

export const ListSchema = new Schema<ListInterface>({
  channelId: {
    type: Number,
    required: true,
  },
  EditablePage: [
    {
      page: {
        type: mongoose.Schema.Types.ObjectId,
        ref: PAGE_TYPE.PAGE,
      },
      template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: PAGE_TYPE.TEMPLATE,
      },
    },
  ],
  SocketPage: [
    {
      page: {
        type: mongoose.Schema.Types.ObjectId,
        ref: PAGE_TYPE.SOCKET,
      },
    },
  ],
});
