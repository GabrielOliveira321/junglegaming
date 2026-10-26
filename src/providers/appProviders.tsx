import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { getSocketClient } from "@/lib/socketClient";
import { getAuthTokenChangedEventName, getAuthUserId } from "@/lib/authToken";

type RealtimeEventBase = {
  eventId: string;
  resourceType: "cart" | "order" | "nft";
  resourceId: string;
  version: number;
  occurredAt: string;
};

type OrderUpdatedEvent = RealtimeEventBase & {
  userId: string;
  status?: "pending" | "confirmed" | "declined";
};

type NftUpdatedEvent = RealtimeEventBase & {
  priceEth?: number;
  availableEditions?: number;
};

function RealtimeQuerySync() {
  const queryClient = useQueryClient();
  const seenEvents = useRef(new Set<string>());
  const latestResourceVersion = useRef(new Map<string, number>());
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const [activeUserId, setActiveUserId] = useState<string | null>(() => getAuthUserId());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncAuthUser = () => {
      setActiveUserId(getAuthUserId());
    };

    const authEvent = getAuthTokenChangedEventName();
    window.addEventListener(authEvent, syncAuthUser);
    window.addEventListener("storage", syncAuthUser);

    return () => {
      window.removeEventListener(authEvent, syncAuthUser);
      window.removeEventListener("storage", syncAuthUser);
    };
  }, []);

  useEffect(() => {
    if (!activeUserId) {
      return;
    }

    const socket = getSocketClient();

    const shouldApplyEvent = (event: RealtimeEventBase) => {
      if (seenEvents.current.has(event.eventId)) {
        return false;
      }

      seenEvents.current.add(event.eventId);
      if (seenEvents.current.size > 500) {
        seenEvents.current.clear();
        seenEvents.current.add(event.eventId);
      }

      const resourceKey = `${event.resourceType}:${event.resourceId}`;
      const previousVersion = latestResourceVersion.current.get(resourceKey);
      if (typeof previousVersion === "number" && event.version <= previousVersion) {
        return false;
      }

      latestResourceVersion.current.set(resourceKey, event.version);
      return true;
    };

    const reconcileActiveResources = () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["quote"] });
      setLiveAnnouncement("Resumo do carrinho atualizado em tempo real.");
      queryClient.invalidateQueries({ queryKey: ["nfts", "list"] });
      queryClient.invalidateQueries({ queryKey: ["nfts", "details"] });
    };

    const handleOrderUpdated = (payload: OrderUpdatedEvent) => {
      if (!payload || payload.resourceType !== "cart" && payload.resourceType !== "order") {
        return;
      }

      if (payload.userId !== activeUserId) {
        return;
      }

      if (!shouldApplyEvent(payload)) {
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["quote"] });
      setLiveAnnouncement("Preço ou disponibilidade de NFT atualizado.");
    };

    const handleNftUpdated = (payload: NftUpdatedEvent) => {
      if (!payload || payload.resourceType !== "nft") {
        return;
      }

      if (!shouldApplyEvent(payload)) {
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["nfts", "list"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["quote"] });

      if (payload.resourceId) {
        queryClient.invalidateQueries({ queryKey: ["nfts", "details", payload.resourceId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["nfts", "details"] });
      }
    };

    const handleReconnect = () => {
      reconcileActiveResources();
      setLiveAnnouncement("Conexão restabelecida. Dados sincronizados com a API.");
    };

    socket.on("order.updated", handleOrderUpdated);
    socket.on("nft.updated", handleNftUpdated);
    socket.on("connect", handleReconnect);
    socket.on("reconnect", handleReconnect);
    if (!socket.connected && !socket.active) {
      socket.connect();
    }

    return () => {
      socket.off("order.updated", handleOrderUpdated);
      socket.off("nft.updated", handleNftUpdated);
      socket.off("connect", handleReconnect);
      socket.off("reconnect", handleReconnect);
    };
  }, [activeUserId, queryClient]);

  return <p className="sr-only" aria-live="polite">{liveAnnouncement}</p>;
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeQuerySync />
      {children}
    </QueryClientProvider>
  );
}
