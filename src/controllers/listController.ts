import { templateService, pageService } from "../services";
import { AsyncRequestHandler } from "../types";

interface IListController {
  findList: AsyncRequestHandler;
}

export class ListController implements IListController {
  findList: AsyncRequestHandler = async (req, res) => {
    const channel = req.query.channel as string;
    const channelId = parseInt(channel);
    const findPageList = await pageService.findPageList(channelId);
    const findTemplateList = await templateService.findTemplateList(channelId);
    const findList = { List: [...findPageList, ...findTemplateList] };
    res.json(findList);
  };
}
export const listController = new ListController();
