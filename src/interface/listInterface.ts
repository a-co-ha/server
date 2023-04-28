import { page, socketPage } from "./pageInterface";
export interface list {
  channelId: number;
  EditablePage: page[];
  SocketPage: socketPage[];
}
