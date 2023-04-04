// import { UserAttributes } from "./../interface/userInterface";
// import io from "socket.io-client";
// import { port } from "../config";

// export const connectSocket = (
//   sessionId: string,
//   user: UserAttributes
// ): Promise<any> => {
//   return new Promise((resolve, reject) => {
//     const socket = io(`http://localhost:${port}`, {
//       auth: { sessionId, user },
//     });

//     socket.on("connect", () => {
//       resolve(socket);
//     });

//     socket.on("connect_error", (error) => {
//       reject(error);
//     });
//   });
// };
