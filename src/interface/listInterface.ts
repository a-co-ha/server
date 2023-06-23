import {
  page,
  PageInterface,
  SocketInterface,
  socketPage,
  TemplateInterface,
} from "../interface";
import { AsyncRequestHandler } from "../utils";
export interface list {
  channelId: number;
  EditablePage: page[];
  SocketPage: socketPage[];
}

export interface ListInterface {
  channelId: number;
  channelName?: string;
  channelImg?: string;
  EditablePage: [
    { page: PageInterface; _id: string },
    { template: TemplateInterface; _id: string }
  ];
  SocketPage: [{ page: SocketInterface; _id: string }];
}

export interface IListController {
  findList: AsyncRequestHandler;
  updateList: AsyncRequestHandler;
  deleteListOne: AsyncRequestHandler;
}
