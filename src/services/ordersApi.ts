import type { OrderCreateRequest, OrderResponse } from "@/contracts/rest";
import { httpClient } from "@/lib/httpClient";

export async function createOrder(payload: OrderCreateRequest, idempotencyKey: string) {
  const response = await httpClient.post<OrderResponse>("/api/orders", payload, {
    headers: {
      "idempotency-key": idempotencyKey,
    },
  });
  return response.data;
}

export async function getOrder(orderId: string) {
  const response = await httpClient.get<OrderResponse>(`/api/orders/${orderId}`);
  return response.data;
}
