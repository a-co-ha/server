import {
  AnnouncementsAttributes,
  editAnnouncements,
  AnnouncementsInfo,
  IAnnounmentsController,
} from "../interface";
import { AnnouncementsService, announcementsService } from "../services";
import { AsyncRequestHandler } from "../utils";
import { MysqlTransaction, mysqlTransaction } from "../db";
import { Announcements } from "../model";

export class AnnouncementsController implements IAnnounmentsController {
  constructor(
    private announcementsService: AnnouncementsService,
    private mysqlTransaction: MysqlTransaction
  ) {}

  public createAnnouncements: AsyncRequestHandler = async (req, res) => {
    const { userId, name } = req.user;
    const { channel, title, content } = req.body;
    const announcementsInfo: AnnouncementsAttributes = {
      channelId: channel,
      title,
      content,
      userId,
      userName: name,
    };
    let newAnnouncements: Announcements;
    await this.mysqlTransaction.execute(async (t) => {
      newAnnouncements = await this.announcementsService.createAnnouncements(
        t,
        announcementsInfo
      );
    });
    res.json(newAnnouncements);
  };

  public findOneAnnouncements: AsyncRequestHandler = async (req, res) => {
    const { channel: channelId, id: announcementsId } = req.body;
    const userId = req.user.userId;
    const findAnnouncementsInfo: AnnouncementsInfo = {
      channelId,
      announcementsId,
      userId,
    };
    let findOneAnnouncements: Announcements;
    await this.mysqlTransaction.execute(async (t) => {
      findOneAnnouncements =
        await this.announcementsService.findOneAnnouncements(
          t,
          findAnnouncementsInfo
        );
    });

    res.json(findOneAnnouncements);
  };

  public findAllAnnouncementsInChannel: AsyncRequestHandler = async (
    req,
    res
  ) => {
    const { channel: channelId, id: announcementsId } = req.body;
    const userId = req.user.userId;
    const findAnnouncementsInfo: AnnouncementsInfo = {
      channelId,
      announcementsId,
      userId,
    };
    const findAllAnnouncementsInChannel =
      await this.announcementsService.findAllAnnouncementsInChannel(
        findAnnouncementsInfo
      );
    res.json(findAllAnnouncementsInChannel);
  };

  public editAnnouncements: AsyncRequestHandler = async (req, res) => {
    const {
      channel: channelId,
      id: announcementsId,
      title,
      content,
    } = req.body;
    const userId = req.user.userId;

    const editAnnouncements: editAnnouncements = {
      channelId,
      announcementsId,
      title,
      content,
      userId,
    };

    let editAnnouncementsResult: Announcements;
    await this.mysqlTransaction.execute(async (t) => {
      editAnnouncementsResult =
        await this.announcementsService.editAnnouncements(t, editAnnouncements);
    });
    res.json(editAnnouncementsResult);
  };

  public deleteAnnouncements: AsyncRequestHandler = async (req, res) => {
    const { channel: channelId, id: announcementsId } = req.body;
    const userId = req.user.userId;
    const deleteAnnouncementsInfo: AnnouncementsInfo = {
      channelId,
      announcementsId,
      userId,
    };
    let deleteAnnouncementsResult: number;
    await this.mysqlTransaction.execute(async (t) => {
      deleteAnnouncementsResult =
        await this.announcementsService.deleteAnnouncements(
          t,
          deleteAnnouncementsInfo
        );
    });
    res.json(deleteAnnouncementsResult);
  };
}

export const announcementsController = new AnnouncementsController(
  announcementsService,
  mysqlTransaction
);
