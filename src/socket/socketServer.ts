import { SocketEmitter } from "./socketEmitter";
import { userService } from "../services";
import { ioCorsOptions } from "../config";
import { Server, Socket as SocketIO } from "socket.io";
import sharedSession from "express-socket.io-session";
import { useSession } from "../middlewares";
import { socketValidation } from "../middlewares";
import { RedisHandler, logger, createSocketAdapter } from "../utils";
import { Server as httpServer } from "http";
import { SocketListener } from "./socketListeners";
import { instrument } from "@socket.io/admin-ui";

export class Socket {
  static CONNECTION = "connection";
  static DISCONNECTION = "disconnect";
  static JOIN_CHANNEL = "JOIN_CHANNEL";
  static SEND_MESSAGE = "SEND_MESSAGE";
  static READ_MESSAGE = "READ_MESSAGE";
  static SET_BOOKMARK = "SET_BOOKMARK";
  static SET_ALERT = "SET_ALERT";
  static READ_ALERT = "READ_ALERT";
  private io: Server;
  private connectedSession: Map<string, SocketIO>;
  constructor(
    server: httpServer,
    private socketListener: SocketListener,
    private socketEmitter: SocketEmitter
  ) {
    this.io = new Server(server, ioCorsOptions);
    this.connectedSession = new Map();
  }

  async config() {
    const adapter = await createSocketAdapter();
    this.io.adapter(adapter);

    this.io.use(
      sharedSession(useSession(), {
        autoSave: true,
      })
    );
    instrument(this.io, {
      auth: false,
    });
  }

  public start() {
    this.io.on(Socket.CONNECTION, async (socket: SocketIO) => {
      try {
        const sessionID =
          socket.handshake.auth.sessionID || socket.handshake.headers.sessionid;

        if (!sessionID) {
          throw new Error("세션이 만료되었습니다. 로그인을 해주세요.");
        }

        const existSocket = this.connectedSession.get(sessionID);

        if (!existSocket) {
          await socketValidation(sessionID, socket);

          socket.join(socket.userID.toString());
          await this.socketEmitter.join(socket, socket.roomIds);
          await this.socketEmitter.getUsers(socket);
          await this.socketEmitter.userInfo(socket);
          await this.socketEmitter.messageStatus(socket);
          await this.socketEmitter.myAlert(socket);
          this.connectedSession.set(sessionID, socket);
          this.handleSocketEvents(socket);
        } else {
          console.log("소켓있음");
          await this.socketEmitter.messageStatus(existSocket);
          await this.socketEmitter.myAlert(existSocket);
          this.handleSocketEvents(existSocket);
          socket.disconnect();
        }
      } catch (err: any) {
        logger.error(err.message);
        socket.disconnect();
        return;
      }
    });
  }

  private handleSocketEvents(socket: SocketIO): void {
    socket.on(Socket.JOIN_CHANNEL, this.socketListener.joinChannel(socket));

    socket.on(Socket.SEND_MESSAGE, this.socketListener.sendMessage(socket));

    socket.on(Socket.READ_MESSAGE, this.socketListener.readMessage(socket));

    socket.on(Socket.SET_BOOKMARK, this.socketListener.setBookmark(socket));

    socket.on(Socket.SET_ALERT, this.socketListener.setLabel(socket));

    socket.on(Socket.READ_ALERT, this.socketListener.readLabel(socket));

    socket.on(Socket.DISCONNECTION, async () => {
      this.connectedSession.delete(socket.sessionID);

      const matchingSockets = await this.io
        .in(socket.userID.toString())
        .fetchSockets();

      const isDisconnected = matchingSockets.length === 0;

      if (isDisconnected) {
        for (const room of socket.roomIds) {
          socket.leave(room.id);

          socket.broadcast.to(room.id).emit("DISCONNECT_MEMBER", {
            roomId: room.id,
            userID: socket.userID,
            name: socket.name,
            connected: false,
          });
        }
      }
    });
  }
}
