export interface block {
  tag: string;
  html?: string;
  imgUrl?: string;
}

export interface page {
  channelId?: number;
  postName?: string;
  label?: {};
  blocks: {};
}

export interface IPostModel {
  findPost(channelId: number, id: string): Promise<page>;
  createPost(channelId: page): Promise<page>;
  pushPost(id: string, page: page): Promise<page>;
  deletePost(id: string): Promise<object>;
}

export interface progress {
  channelId: number;
  postName: string;
  page: page;
}

export interface IProgressModel {}

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
