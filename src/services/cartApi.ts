import type {
  AddCartItemRequest,
  CartResponse,
  QuoteRequest,
  QuoteResponse,
  UpdateCartItemRequest,
} from "@/contracts/rest";
import { httpClient } from "@/lib/httpClient";

export async function getCart(signal?: AbortSignal) {
  const response = await httpClient.get<CartResponse>("/api/cart", { signal });
  return response.data;
}

export async function addCartItem(payload: AddCartItemRequest) {
  const response = await httpClient.post<CartResponse>("/api/cart/items", payload);
  return response.data;
}

export async function updateCartItem(nftId: string, payload: UpdateCartItemRequest) {
  const response = await httpClient.patch<CartResponse>(`/api/cart/items/${nftId}`, payload);
  return response.data;
}

export async function removeCartItem(nftId: string) {
  const response = await httpClient.delete<CartResponse>(`/api/cart/items/${nftId}`);
  return response.data;
}

export async function getQuote(payload: QuoteRequest, signal?: AbortSignal) {
  const response = await httpClient.post<QuoteResponse>("/api/quote", payload, { signal });
  return response.data;
}
