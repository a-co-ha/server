import { User } from "./userInterface";

export interface MessageAttributes extends Message {
  id: string;
}

export interface Message extends User {
  content?: string;
  roomId?: string | number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PrivateMessage {
  to: number;
  from: number;
  content: string;
}
