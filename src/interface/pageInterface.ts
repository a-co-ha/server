export interface block {
  blockId?: string;
  tag: string;
  html?: string;
  imgUrl?: string;
}

export interface label {
  content: string;
}

export interface page {
  channelId?: number;
  pageName?: string;
  _id?: {};
  label?: {};
  blocks: {};
  type?: string;
  categories?: string;
  session?: any;
}

export interface socketPage {
  channelId?: number;
  pageName?: string;
  _id?: {};
  session?: any;
}

export interface IPageModel {
  findPage(channelId: number, id: string, type?: string): Promise<page>;
  createPage(
    channelId: number,
    blockId: string,
    progressStatus?: string,
    type?: string
  ): Promise<page>;
  pushBlock(id: string, page: page): Promise<page>;
  deletePage(id: string, channelId: number): Promise<object>;
}

export interface pages {
  pageId: {};
  pageName: string;
  label: {};
  status?: string;
}
