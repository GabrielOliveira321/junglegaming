import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QuoteResponse } from "@/contracts/rest";
import { getAuthScopeKey, getAuthToken } from "@/lib/authToken";
import { addCartItem, getCart, getQuote, removeCartItem, updateCartItem } from "@/services/cartApi";
import { createOrder } from "@/services/ordersApi";

export function useCartQuery() {
  const scopeKey = getAuthScopeKey();
  const cartKey = ["cart", scopeKey];

  return useQuery({
    queryKey: cartKey,
    queryFn: ({ signal }) => getCart(signal),
    enabled: Boolean(getAuthToken()),
  });
}

export function useQuoteQuery(couponCode?: string) {
  const scopeKey = getAuthScopeKey();
  const quoteKey = ["quote", scopeKey, couponCode ?? ""];

  return useQuery({
    queryKey: quoteKey,
    queryFn: ({ signal }) => getQuote({ couponCode }, signal),
    enabled: Boolean(getAuthToken()),
    retry: false,
  });
}

export function useAddCartItemMutation() {
  const queryClient = useQueryClient();
  const scopeKey = getAuthScopeKey();
  const cartKey = ["cart", scopeKey];
  const quoteKey = ["quote", scopeKey];

  return useMutation({
    mutationFn: addCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKey });
      queryClient.invalidateQueries({ queryKey: quoteKey });
    },
  });
}

export function useUpdateCartItemMutation() {
  const queryClient = useQueryClient();
  const scopeKey = getAuthScopeKey();
  const cartKey = ["cart", scopeKey];
  const quoteKey = ["quote", scopeKey];

  return useMutation({
    mutationFn: ({ nftId, quantity }: { nftId: string; quantity: number }) =>
      updateCartItem(nftId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKey });
      queryClient.invalidateQueries({ queryKey: quoteKey });
    },
  });
}

export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient();
  const scopeKey = getAuthScopeKey();
  const cartKey = ["cart", scopeKey];
  const quoteKey = ["quote", scopeKey];

  return useMutation({
    mutationFn: (nftId: string) => removeCartItem(nftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKey });
      queryClient.invalidateQueries({ queryKey: quoteKey });
    },
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  const scopeKey = getAuthScopeKey();
  const cartKey = ["cart", scopeKey];
  const quoteKey = ["quote", scopeKey];

  return useMutation({
    mutationFn: ({
      cartVersion,
      quoteVersion,
      paymentMethod,
      idempotencyKey,
    }: {
      cartVersion: number;
      quoteVersion: number;
      paymentMethod: "metamask" | "coinbase";
      idempotencyKey: string;
    }) =>
      createOrder(
        {
          cartVersion,
          quoteVersion,
          paymentMethod,
        },
        idempotencyKey,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKey });
      queryClient.invalidateQueries({ queryKey: quoteKey });
    },
  });
}

export function getQuoteFallbackFromCart(totalEth = 0): QuoteResponse {
  return {
    validCoupon: false,
    couponDiscountEth: 0,
    subtotalEth: totalEth,
    networkFeeEth: 0.016,
    totalEth: totalEth + 0.016,
    quoteVersion: 1,
  };
}
