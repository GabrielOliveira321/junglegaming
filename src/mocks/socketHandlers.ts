import { toSocketIo } from "@mswjs/socket.io-binding";
import { ws } from "msw";

const socketIoLink = ws.link("*/socket.io/*");

type RealtimeEvent = "nft.updated" | "order.updated" | "mock.connected";

const connectedClients = new Set<ReturnType<typeof toSocketIo>["client"]>();

export function emitMockEvent(event: RealtimeEvent, payload: unknown) {
  for (const client of connectedClients) {
    client.emit(event, payload);
  }
}

export const socketHandlers = [
  socketIoLink.addEventListener("connection", (connection) => {
    const { client, rawClient } = toSocketIo(connection);

    connectedClients.add(client);

    rawClient.addEventListener("close", () => {
      connectedClients.delete(client);
    });

    client.emit("mock.connected", {
      transport: "msw-socket.io-binding",
    });
  }),
];