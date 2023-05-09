import { User, UserOfRoom } from "../interface";
import { AsyncRequestHandler } from "../utils";

export interface MessageAttributes extends MessageData {
  id: string;
}

export interface MessageData extends User {
  content?: string;
  roomId?: string | number;
  createdAt?: Date;
  updatedAt?: Date;
  readUser?: number[] | UserOfRoom[];
}

export interface IMessageController {
  createMessage: AsyncRequestHandler;
}
