import { io, type Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export function getSocketClient() {
  if (socketInstance) {
    return socketInstance;
  }

  socketInstance = io(import.meta.env.VITE_SOCKET_URL ?? "/", {
    autoConnect: false,
    transports: ["websocket"],
  });

  return socketInstance;
}
