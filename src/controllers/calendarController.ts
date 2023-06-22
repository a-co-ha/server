import {
  CalendarService,
  calendarService,
} from "./../services/calendarService";
import { AsyncRequestHandler } from "../utils";
import { MysqlTransaction, mysqlTransaction } from "../db";
import { CalendarAtributes, ICalendarInterface } from "../interface";
import { Calendar } from "../model";

export class CalendarController implements ICalendarInterface {
  constructor(
    private calendarService: CalendarService,
    private mysqlTransaction: MysqlTransaction
  ) {}

  public createSchedule: AsyncRequestHandler = async (req, res) => {
    const { userId, name } = req.user;
    const { channel, content, date } = req.body;
    const scheduleInfo: CalendarAtributes = {
      channelId: channel,
      date,
      content,
      userId,
      userName: name,
    };

    let newSchedule: Calendar;
    await this.mysqlTransaction.execute(async (t) => {
      newSchedule = await this.calendarService.createSchedule(t, scheduleInfo);
    });
    res.json(newSchedule);
  };

  public findSchedulesByDate: AsyncRequestHandler = async (req, res) => {
    const { channel, date } = req.body;
    const findSchedulesByDate = await this.calendarService.findSchedulesByDate(
      channel,
      date
    );
    res.json(findSchedulesByDate);
  };

  public findSchedulesByChannel: AsyncRequestHandler = async (req, res) => {
    const { channel } = req.body;
    const findSchedulesByChannel =
      await this.calendarService.findSchedulesByChannel(channel);
    res.json(findSchedulesByChannel);
  };

  public deleteSchedules: AsyncRequestHandler = async (req, res) => {
    const { id: scheduleId, channel: channelId } = req.body;
    let deleteSchedule: number;
    await this.mysqlTransaction.execute(async (t) => {
      deleteSchedule = await this.calendarService.deleteSchedules(
        t,
        channelId,
        scheduleId
      );
    });
    res.json(deleteSchedule);
  };
}

export const calendarController = new CalendarController(
  calendarService,
  mysqlTransaction
);
