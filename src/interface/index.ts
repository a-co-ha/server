interface block {
  tag: string;
  content?: string;
  imgUrl?: string;
}

interface post {
  blocks: {};
}

interface IPostModel {
  findPost(id: string): Promise<post>;
  findPostBlock(id: string, blockId: string): Promise<post>;
  createPost(block: post): Promise<post>;
  pushPost(id: string, post: block): Promise<post>;
  deletePost(id: string): Promise<object>;
}

export { post, block, IPostModel };

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
