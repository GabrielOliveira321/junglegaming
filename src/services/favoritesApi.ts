import type { FavoriteListResponse } from "@/contracts/rest";
import { httpClient } from "@/lib/httpClient";

export async function getFavorites(signal?: AbortSignal) {
  const response = await httpClient.get<FavoriteListResponse>("/api/favorites", { signal });
  return response.data;
}

export async function addFavorite(nftId: string) {
  const response = await httpClient.post<FavoriteListResponse>("/api/favorites", { nftId });
  return response.data;
}

export async function removeFavorite(nftId: string) {
  const response = await httpClient.delete<FavoriteListResponse>(`/api/favorites/${nftId}`);
  return response.data;
}
