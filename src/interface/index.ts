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
  pushPost(id: string, post: block, blockId: string): Promise<post>;
  deletePost(id: string): Promise<object>;
}

export { post, block, IPostModel };
