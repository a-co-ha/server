import { instrument } from "@socket.io/admin-ui";
import { Server as httpServer } from "http";
import { Server, Socket as SocketIO } from "socket.io";
import { ioCorsOptions } from "../config";
import { socketValidation } from "../middlewares";
import { createSocketAdapter, logger } from "../utils";
import { SocketEmitter } from "./socketEmitter";
import { SocketListener } from "./socketListeners";

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

        await socketValidation(sessionID, socket);
        await this.handleSocketEvents(socket).catch((err) => {
          throw new Error(err);
        });
        socket.join(socket.userID.toString());
        await this.socketEmitter.join(socket, socket.roomIds);
        await this.socketEmitter.getCurrentMembers(socket);
        await this.socketEmitter.messageStatus(socket);
        await this.socketEmitter.myAlert(socket);
      } catch (err: any) {
        console.log(err);
        logger.error(err.message);
        socket.disconnect();
        return;
      }
    });
  }

  private async handleSocketEvents(socket: SocketIO): Promise<void> {
    socket.on(Socket.SEND_MESSAGE, this.socketListener.sendMessage(socket));
    socket.on(Socket.READ_MESSAGE, this.socketListener.readMessage(socket));
    socket.on(Socket.SET_BOOKMARK, this.socketListener.setBookmark(socket));
    socket.on(Socket.SET_ALERT, this.socketListener.setLabel(socket));
    socket.on(Socket.READ_ALERT, this.socketListener.readLabel(socket));
    socket.on(Socket.JOIN_CHANNEL, this.socketListener.joinChannel(socket));
    socket.on(
      Socket.DISCONNECTION,
      this.socketListener.disconnect(socket, this.io)
    );
  }
}
