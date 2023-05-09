import { UserOfRoom, User } from "../interface";
import { AsyncRequestHandler } from "../utils";

export interface MessageAttributes extends Message {
  id: string;
}

export interface Message extends User {
  content?: string;
  roomId?: string | number;
  createdAt?: Date;
  updatedAt?: Date;
  readUser?: number[] | UserOfRoom[];
}

export interface IMessageController {
  createMessage: AsyncRequestHandler;
}
