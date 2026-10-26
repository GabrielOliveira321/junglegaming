import type { Nft, NftListResponse } from "@/contracts/rest";
import { httpClient } from "@/lib/httpClient";

export type NftListQuery = {
  q?: string;
  category?: string;
  sort?: string;
  page?: number;
  perPage?: number;
};

export async function getNftList(params: NftListQuery, signal?: AbortSignal) {
  const response = await httpClient.get<NftListResponse>("/api/nfts", {
    params,
    signal,
  });
  return response.data;
}

export async function getNftById(nftId: string, signal?: AbortSignal) {
  const response = await httpClient.get<Nft>(`/api/nfts/${nftId}`, { signal });
  return response.data;
}
