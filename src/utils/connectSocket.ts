import { UserAttributes } from "./../interface/userInterface";
import io from "socket.io-client";
import { port } from "../config";

export const connectSocket = (token): Promise<any> => {
  return new Promise((resolve, reject) => {
    const socket = io(`http://localhost:${port}`, {
      auth: { token: `access ${token}` },

      withCredentials: true,
    });

    socket.on("connect", () => {
      resolve(socket);
    });

    socket.on("connect_error", (error) => {
      reject(error);
    });
  });
};
