import io from "socket.io-client";
import { port } from "../config";
import { logger } from "./winston";

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
    socket.on("RECEIVE_MESSAGE", (data) => {
      logger.warn(`RECEIVE_MESSAGE ${JSON.stringify(data)}`);
    });
    socket.on("USER_INFO", (data) => {
      logger.warn(`session ${JSON.stringify(data)}`);

      setTimeout(() => {
        socket.emit("SEND_MESSAGE", {
          content: "14010410401401",
          roomId: "6443575dbcd860241c4cf186",
        });
      }, 5000);
    });
    socket.on("NEW_MEMBER", (data) => {
      logger.warn(`user connected ${JSON.stringify(data)}`);
    });

    socket.on("disconnect", (data) => {
      logger.warn(` disconnect ${JSON.stringify(data)}`);
    });
  });
};
