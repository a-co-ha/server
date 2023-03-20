import { templateService, pageService } from "../services";
import { AsyncRequestHandler } from "../types";
import { listService } from "../services/listService";

interface IListController {
  findList: AsyncRequestHandler;
  createList: AsyncRequestHandler;
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
    // const findPageList = await pageService.findPageList(channelId);
    // const findTemplateList = await templateService.findTemplateList(channelId);
    // const findList = { List: [...findPageList, ...findTemplateList] };
    // res.json(findList);
    const list = await listService.findList(channelId);
    res.json(list);
  };
}
export const listController = new ListController();
