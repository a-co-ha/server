// interface post {}
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
