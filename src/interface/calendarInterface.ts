import { AsyncRequestHandler } from "../utils";

export interface CalendarAtributes {
  id?: number;
  channelId: number;
  date: string;
  content: string;
  userId: number;
  userName: string;
}

export interface ICalendarInterface {
  createSchedule: AsyncRequestHandler;
  findSchedulesByDate: AsyncRequestHandler;
  findSchedulesByChannel: AsyncRequestHandler;
}
