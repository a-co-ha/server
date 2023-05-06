export interface Room {
  id: string;
  readUser: UserOfRoom[] | number[];
}

export interface UserOfRoom {
  userID: number;
}
