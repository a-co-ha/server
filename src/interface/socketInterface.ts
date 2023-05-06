export interface Room {
  id: string;
  readUser: UserOfRoom[] | number[];
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
