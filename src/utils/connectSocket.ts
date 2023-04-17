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
    socket.on("users", (data) => {
      logger.info("users", JSON.stringify(data));
    });
    socket.on("message-receive", (data) => {
      logger.info("receive message ", data);
    });
    socket.on("session", (data) => {
      logger.info("session", data);
      setTimeout(() => {
        // socket.emit("force disconnect");
        //{
        socket.emit("message-send", {
          roomId: data?.roomIds[0],
          text: "444444",
        });
      }, 10000);
    });
    socket.on("user connected", (data) => {
      logger.info("user_connected", data);
    });
  });
};
