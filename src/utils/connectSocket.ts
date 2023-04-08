import { UserAttributes } from "./../interface/userInterface";
import io from "socket.io-client";
import { port } from "../config";

export const connectSocket = (sessionID): Promise<any> => {
  return new Promise((resolve, reject) => {
    const socket = io(`http://localhost:${port}`, {
      withCredentials: true,
      auth: {
        sessionID,
      },
    });

    socket.on("connect", () => {
      resolve(socket);
    });

    socket.on("connect_error", (error) => {
      reject(error);
    });
  });
};
