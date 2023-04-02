import { templateService, pageService } from "../services";
import { AsyncRequestHandler } from "../types";
import { listService } from "../services/listService";

interface IListController {
  findList: AsyncRequestHandler;
  createList: AsyncRequestHandler;
  updateList: AsyncRequestHandler;
  deleteListOne: AsyncRequestHandler;
  deleteList: AsyncRequestHandler;
}

export class ListController implements IListController {
  createList: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const list = await listService.createList(channelId);
    res.json(list);
  };

  findList: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const list = await listService.findList(channelId);
    res.json(list);
  };

  updateList: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const listPage = req.body.ListPage;
    const list = await listService.updateList(channelId, listPage);
    res.json(list);
  };
  deleteListOne: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const id = req.params.id;
    const type = req.query.type;
    if (
      type === "normal" ||
      type === "progress-page" ||
      type === "normal-page"
    ) {
      await pageService.deletePage(id, channelId);
    }
    if (type === "template-progress" || type === "template-normal") {
      await templateService.deleteTemplate(id, channelId);
    }
    const list = await listService.findList(channelId);
    res.json(list);
  };

  deleteList: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const deleteList = await listService.deleteList(channelId);

    res.json(deleteList);
  };
}
export const listController = new ListController();
