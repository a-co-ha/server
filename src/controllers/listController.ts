import { templateService, pageService } from "../services";
import { AsyncRequestHandler } from "../constants";
import { listService } from "../services/listService";
import { mongoTransaction, MongoTransaction } from "../db";
import { ClientSession } from "mongoose";

interface IListController {
  findList: AsyncRequestHandler;
  updateList: AsyncRequestHandler;
  deleteListOne: AsyncRequestHandler;
}

export class ListController implements IListController {
  constructor(private mongoTransaction: MongoTransaction) {
    this.mongoTransaction = mongoTransaction;
  }
  findList: AsyncRequestHandler = async (req, res) => {
    const { channel } = req.body;
    const list = await listService.findList(channel);
    res.json(list);
  };

  //배열변경
  updateList: AsyncRequestHandler = async (req, res) => {
    const { EditablePage, channel } = req.body;
    const listArrUpateResult = await this.mongoTransaction.withTransaction(
      async (session: ClientSession) => {
        const list = await listService.updateList(
          channel,
          EditablePage,
          session
        );
        return list;
      }
    );
    res.json(listArrUpateResult);
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
          await pageService.deletePage(id, channel, session);
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
    const list = await listService.findList(channel);
    res.json(list);
  };
}
export const listController = new ListController(mongoTransaction);
