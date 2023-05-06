import { basicPageOrTemplateInfo } from "./pageInterface";
export interface template {
  id?: string;
  channelId: number;
  pageName?: string;
  pages: {};
  type?: string;
}

export interface parentTemplateInfo {
  pageType: string;
  parentTemplate?: string;
  progressStatus?: string;
}

export interface putPageInTemplate extends basicPageOrTemplateInfo {
  blockId: string;
  progressStatus?: string;
}

export interface pageStatusUpdate {
  _id: string;
  progressStatus?: string;
}

export interface progressPercentage {
  percentage: number;
}

export interface updateTemplateInfo extends basicPageOrTemplateInfo {
  pageName: string;
  pages: pageStatusUpdate[];
}

export interface progressPercentageArray extends progressPercentage {
  _id: string;
  pageName: string;
}
