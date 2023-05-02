export interface Room {
  id: string;
  readUser: UserOfRoom[] | number[];
  unreadCount: number;
}

export interface UserOfRoom {
  userID: number;
}

export interface SocketData {
  sessionID?: string;
  userID: number;
  name: string;
  rooms: string[];
}
