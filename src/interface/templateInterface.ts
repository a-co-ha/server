export interface template {
  id?: string;
  channelId: number;
  pageName?: string;
  pages: {};
  type?: string;
}

export interface templateInfo {
  pageType: string;
  parentTemplate?: string;
  progressStatus?: string;
}

export interface pageStatusUpdate {
  _id: string;
  progressStatus?: string;
}

export interface progressPercentage {
  percentage: number;
}

export interface progressPercentageArray extends progressPercentage {
  _id: string;
  pageName: string;
}
