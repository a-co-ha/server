import { Op } from "sequelize";
import { Transaction, where } from "sequelize";
import { CalendarAtributes } from "../interface";
import { Calendar, calendarModel } from "../model";

export class CalendarService {
  constructor(private calendarModel: Calendar) {}

  public async createSchedule(
    t: Transaction,
    scheduleInfo: CalendarAtributes
  ): Promise<Calendar> {
    const { channelId, content, userId, userName, date } = scheduleInfo;
    const newSchedule = await Calendar.create(
      {
        channelId,
        content,
        userId,
        userName,
        date,
      },
      { transaction: t }
    );

    return newSchedule;
  }

  public async findSchedulesByDate(
    channelId: number,
    date: string
  ): Promise<Calendar[]> {
    const findSchedulesByDate = await Calendar.findAll({
      where: { [Op.and]: [{ channelId }, { date }] },
    });
    return findSchedulesByDate;
  }

  public async findSchedulesByChannel(channelId: number): Promise<Calendar[]> {
    const findSchedulesByChannel = await Calendar.findAll({
      where: { channelId },
    });
    return findSchedulesByChannel;
  }

  public async deleteSchedules(
    t: Transaction,
    channelId: number,
    scheduleId: number
  ): Promise<number> {
    const deleteSchedules = await Calendar.destroy({
      where: {
        [Op.and]: [{ channelId }, { id: scheduleId }],
      },
      transaction: t,
    });
    return deleteSchedules;
  }
}
export const calendarService = new CalendarService(calendarModel);
