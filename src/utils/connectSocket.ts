import io from "socket.io-client";
import { port } from "../config";
import { LogColor } from "../constants";

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
      console.log(LogColor.INFO, "users", JSON.stringify(data));
    });
    socket.on("message-send", (data) => {
      console.log(LogColor.INFO, "receive message ", data);
    });
    socket.on("session", (data) => {
      console.log(LogColor.INFO, "session", data);
      setTimeout(() => {
        socket.emit("force disconnect");
        //{
        //   socket.emit("message-send", {
        //     roomId: data?.roomIds[0],
        //     text: "444444",
        //   }
        // );
      }, 10000);
    });
    socket.on("user connected", (data) => {
      console.log(LogColor.INFO, "user_connected", data);
    });
  });
};
