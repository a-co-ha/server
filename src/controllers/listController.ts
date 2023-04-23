import { socketModel } from "./../model/index";
import {
  templateService,
  pageService,
  PageService,
  BookmarkListService,
} from "../services";
import { AsyncRequestHandler } from "../constants";
import { ListService, listService } from "../services/listService";
import { mongoTransaction, MongoTransaction } from "../db";
import { ClientSession } from "mongoose";

interface IListController {
  findList: AsyncRequestHandler;
  updateList: AsyncRequestHandler;
  deleteListOne: AsyncRequestHandler;
}

export class ListController implements IListController {
  constructor(
    private mongoTransaction: MongoTransaction,
    private pageService: PageService,
    private listService: ListService
  ) {
    this.mongoTransaction = mongoTransaction;
  }
  findList: AsyncRequestHandler = async (req, res) => {
    const { channel } = req.body;
    const list = await this.listService.findList(channel);
    res.json(list);
  };

  //배열변경
  updateList: AsyncRequestHandler = async (req, res) => {
    const { EditablePage: editablePage, channel } = req.body;
    const listArrUpdateResult = await this.mongoTransaction.withTransaction(
      async (session: ClientSession) => {
        const list = await this.listService.updateList(
          channel,
          editablePage,
          session
        );
        return list;
      }
    );
    res.json(listArrUpdateResult);
  };

  deleteListOne: AsyncRequestHandler = async (req, res) => {
    const { id, type, channel } = req.body;

    if (
      type === "normal" ||
      type === "progress-page" ||
      type === "normal-page"
    ) {
      await this.mongoTransaction.withTransaction(
        async (session: ClientSession) => {
          await this.pageService.deletePage(id, channel, session);
        }
      );
    }
    if (type === "template-progress" || type === "template-normal") {
      await this.mongoTransaction.withTransaction(
        async (session: ClientSession) => {
          await templateService.deleteTemplate(id, channel, session);
        }
      );
    }
    const list = await this.listService.findList(channel);
    res.json(list);
  };
}
export const listController = new ListController(
  mongoTransaction,
  pageService,
  listService
);
