import { AsyncRequestHandler } from "../utils";

export interface AnnouncementsAttributes {
  id?: number;
  channelId: number;
  title: string;
  content: string;
  userId: number;
  userName?: string;
}

export interface AnnouncementsInfo {
  channelId: number;
  announcementsId: number;
  userId?: number;
}

export interface announcementsIsAuthor extends AnnouncementsAttributes {
  isAuthor: boolean;
}

export interface editAnnouncements extends AnnouncementsInfo {
  title: string;
  content: string;
}

export interface IAnnounmentsController {
  createAnnouncements: AsyncRequestHandler;
  findOneAnnouncements: AsyncRequestHandler;
  findAllAnnouncementsInChannel: AsyncRequestHandler;
  editAnnouncements: AsyncRequestHandler;
}
