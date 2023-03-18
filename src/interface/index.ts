export interface block {
  blockId?: string;
  tag: string;
  html?: string;
  imgUrl?: string;
}

export interface page {
  channelId?: number;
  pageName?: string;
  _id?: {};
  label?: {};
  blocks: {};
  type?: string;
}

export interface IPostModel {
  findPost(channelId: number, id: string): Promise<page>;
  createPost(
    channelId: number,
    blockId: string,
    progressStatus?: string
  ): Promise<page>;
  pushPost(id: string, page: page): Promise<page>;
  deletePost(id: string): Promise<object>;
}

export interface pages {
  pageId: {};
  pageName: string;
  label: {};
  status?: string;
}
export interface progress {
  channelId: number;
  pageName?: string;
  pages: {};
  type?: string;
}
export interface postStatusUpdate {
  _id: string;
  progressStatus?: string;
}

export interface IProgressModel {
  createProgress(
    channelId: number,
    blockId: string,
    type?: string
  ): Promise<progress>;
  findProgress(channelId: number, id: string): Promise<progress>;
  addProgress(
    channelId: number,
    id: string,
    blockId: string,
    progressStatus: string
  ): Promise<progress>;
  updateProgress(
    channelId: number,
    id: string,
    pages: [postStatusUpdate]
  ): Promise<progress>;
  deleteProgress(id: string): Promise<object>;
  percentageProgress(id: string): Promise<object>;
}

export interface MessageAttributes {
  id?: string;
  name: string;
  githubID: string;
  img?: string;
  text?: string;
  channelId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export * from "./channelInterface";
export * from "./userInterface";
