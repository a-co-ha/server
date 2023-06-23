import {
  AnnouncementsAttributes,
  AnnouncementsInfo,
  announcementsIsAuthor,
  editAnnouncements,
} from "./../interface/announcementsInterface";
import { Announcements, announcementsModel } from "./../model/announcements";
import { Transaction, where } from "sequelize";
import { Op } from "sequelize";
import { ERROR_NAME } from "../constants";

export class AnnouncementsService {
  constructor(private announcementsModel: Announcements) {}

  public async createAnnouncements(
    t: Transaction,
    announcementsInfo: AnnouncementsAttributes
  ): Promise<Announcements> {
    const { channelId, title, content, userId, userName } = announcementsInfo;

    const newAnnouncements = await Announcements.create(
      {
        channelId,
        title,
        content,
        userId,
        userName,
      },
      { transaction: t }
    );
    return newAnnouncements;
  }

  private async isAuthor(
    announcementsIsAuthor: AnnouncementsInfo
  ): Promise<boolean> {
    const { channelId, announcementsId, userId } = announcementsIsAuthor;
    const findOneAnnouncements = await Announcements.findOne({
      where: {
        [Op.and]: [{ channelId }, { id: announcementsId }, { userId }],
      },
    });

    const IsAuthor = findOneAnnouncements !== null;

    return IsAuthor;
  }

  public async findOneAnnouncements(
    t: Transaction,
    findAnnouncementsInfo: AnnouncementsInfo
  ): Promise<any> {
    const { channelId, announcementsId } = findAnnouncementsInfo;
    const isAuthor = await this.isAuthor(findAnnouncementsInfo);

    const findOne = await Announcements.findOne({
      where: {
        [Op.and]: [{ channelId }, { id: announcementsId }],
      },
      transaction: t,
    });

    if (!findOne) {
      throw new Error(ERROR_NAME.ANNOUNCEMENTS_NOT_EXIST);
    }

    const findOneAnnouncements: announcementsIsAuthor = {
      ...findOne.toJSON(),
      isAuthor: isAuthor,
    };

    return findOneAnnouncements;
  }

  public async findAllAnnouncementsInChannel(
    findAnnouncementsInfo: AnnouncementsInfo
  ): Promise<Announcements[]> {
    const { channelId, announcementsId } = findAnnouncementsInfo;
    if (announcementsId === 0) {
      const ViewdFiveRecentAnnouncements = await Announcements.findAll({
        where: {
          channelId,
        },
        raw: true,
        order: [["id", "DESC"]],
        limit: 5,
      });
      return ViewdFiveRecentAnnouncements;
    }

    const FromTheRequestIdViewdFiveAnnouncements = await Announcements.findAll({
      where: {
        channelId,
        id: { [Op.lte]: announcementsId },
      },
      raw: true,
      order: [["id", "DESC"]],
      limit: 5,
    });
    return FromTheRequestIdViewdFiveAnnouncements;
  }

  public async editAnnouncements(
    t: Transaction,
    editAnnouncementsInfo: editAnnouncements
  ): Promise<Announcements> {
    const { channelId, announcementsId, title, content } =
      editAnnouncementsInfo;
    if ((await this.isAuthor(editAnnouncementsInfo)) === true) {
      const editAnnouncements = await Announcements.update(
        { title, content },
        {
          where: { [Op.and]: [{ channelId }, { id: announcementsId }] },
          transaction: t,
        }
      ).then(async () => {
        return await this.findOneAnnouncements(t, editAnnouncementsInfo);
      });

      return editAnnouncements;
    } else {
      throw new Error(ERROR_NAME.ANNOUNCEMENTS_NOT_AN_AUTHOR);
    }
  }

  public async deleteAnnouncements(
    t: Transaction,
    deleteAnnouncementsInfo: AnnouncementsInfo
  ): Promise<number> {
    if ((await this.isAuthor(deleteAnnouncementsInfo)) === true) {
      const { channelId, announcementsId } = deleteAnnouncementsInfo;
      const deleteOne = await Announcements.destroy({
        where: {
          [Op.and]: [{ channelId }, { id: announcementsId }],
        },
        transaction: t,
      });
      return deleteOne;
    }
  }
}

export const announcementsService = new AnnouncementsService(
  announcementsModel
);
