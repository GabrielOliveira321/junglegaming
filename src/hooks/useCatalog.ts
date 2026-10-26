import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthScopeKey, getAuthToken } from "@/lib/authToken";
import { addFavorite, getFavorites, removeFavorite } from "@/services/favoritesApi";
import { getNftById, getNftList, type NftListQuery } from "@/services/nftsApi";
import type { FavoriteListResponse } from "@/contracts/rest";

export function useNftListQuery(params: NftListQuery) {
  return useQuery({
    queryKey: ["nfts", "list", params],
    queryFn: ({ signal }) => getNftList(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useNftDetailsQuery(nftId: string) {
  return useQuery({
    queryKey: ["nfts", "details", nftId],
    queryFn: ({ signal }) => getNftById(nftId, signal),
  });
}

export function useFavoritesQuery() {
  const scopeKey = getAuthScopeKey();

  return useQuery({
    queryKey: ["favorites", scopeKey],
    queryFn: ({ signal }) => getFavorites(signal),
    enabled: Boolean(getAuthToken()),
    retry: false,
  });
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();
  const scopeKey = getAuthScopeKey();
  const favoritesKey = ["favorites", scopeKey];

  return useMutation({
    mutationFn: async ({ nftId, isFavorite }: { nftId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        return removeFavorite(nftId);
      }
      return addFavorite(nftId);
    },
    onMutate: async ({ nftId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: favoritesKey });
      const previous = queryClient.getQueryData<FavoriteListResponse>(favoritesKey);

      const previousIds = previous?.nftIds ?? [];
      const nextIds = isFavorite
        ? previousIds.filter((id) => id !== nftId)
        : [...new Set([...previousIds, nftId])];

      queryClient.setQueryData<FavoriteListResponse>(favoritesKey, {
        nftIds: nextIds,
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(favoritesKey, context.previous);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(favoritesKey, data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoritesKey });
    },
  });
}
