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

export interface UserAttributes {
  id?: number;
  name: string;
  githubID: string;
  githubURL: string;
  img: string;
}
export interface Channel_UserAttributes {
  userId: string;
  channelId: number;
}

export interface ChannelAttributes {
  id: number;
  admin: string;
  channelName: string;
  channelImg: string;
}
export interface IUserModel {
  save(user: UserAttributes): Promise<any>;
  get(user: UserAttributes): Promise<any>;
}

export interface IChannelInfo {
  admin: string;
  channelName: string;
}
export interface IChannel extends IChannelInfo {
  members: UserAttributes[];
}
export interface IChannelModel {
  invite(info: IChannelInfo): Promise<void>;
  join(userId: string, adminCode: string, channelNameCode: any): Promise<any>;
}
