import io from "socket.io-client";
import { port } from "../config";
import { logger } from "./winston";

export const connectSocket = (sessionID, userID): Promise<any> => {
  return new Promise((resolve, reject) => {
    const socket = io(`http://localhost:${port}`, {
      withCredentials: true,
      auth: {
        sessionID,
        userID,
      },
    });

    socket.on("connect", () => {
      resolve(socket);
    });

    socket.on("connect_error", (error) => {
      reject(error);
    });
    socket.on("users", (data) => {
      logger.warn(` users ${JSON.stringify(data)}`);
    });
    socket.on("message-receive", (data) => {
      logger.warn(` message-receive ${JSON.stringify(data)}`);
    });
    socket.on("session", (data) => {
      logger.warn(`session ${JSON.stringify(data)}`);
      setTimeout(() => {
        socket.emit("message-send", {
          roomId: data?.roomIds[0],
          text: "444444",
        });
      }, 10000);
    });
    socket.on("user connected", (data) => {
      logger.warn(`user connected ${JSON.stringify(data)}`);
    });

    socket.on("disconnect", (data) => {
      logger.warn(` disconnect ${JSON.stringify(data)}`);
    });
  });
};
