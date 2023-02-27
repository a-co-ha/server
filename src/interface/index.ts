export interface block {
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
  createPost(channelId: number): Promise<page>;
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

export interface addProgress {
  channelId: number;
  id: string;
  pages?: {};
}

export interface IProgressModel {
  createProgress(progress: progress, progressStatus: string): Promise<progress>;
  findProgress(channelId: number, id: string): Promise<progress>;
  addProgress(addProgress: addProgress): Promise<progress>;
  updateProgress(
    channelId: number,
    id: string,
    pages: [postStatusUpdate]
  ): Promise<progress>;
  deleteProgress(id: string): Promise<object>;
}

export interface UserType {
  name: string;
  githubID: string;
  githubURL: string;
  img: string;
}
export interface IUserModel {
  save(user: UserType): Promise<any>;
  get(user: UserType): Promise<any>;
}

export interface ChannelType {
  admin: string;
  channelName: string;
}
export interface IInviteModel {
  make(channel: ChannelType): Promise<void>;
  join(channelName: string, user: string): Promise<any>;
}
