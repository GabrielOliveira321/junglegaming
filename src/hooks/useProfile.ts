import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type {
  ApiErrorResponse,
  ChangePasswordRequest,
  CreateWalletRequest,
  UpdateProfileRequest,
  UpdateWalletRequest,
} from "@/contracts/rest";
import { getAuthScopeKey, getAuthToken } from "@/lib/authToken";
import {
  changePassword,
  createWallet,
  getProfile,
  getWallets,
  updateProfile,
  updateWallet,
} from "@/services/profileApi";

function getProfileQueryKey(scopeKey: string) {
  return ["profile", scopeKey];
}

function getWalletsQueryKey(scopeKey: string) {
  return ["wallets", scopeKey];
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiErrorResponse | undefined)?.error?.message ?? fallback;
  }
  return fallback;
}

export function useProfileQuery() {
  const scopeKey = getAuthScopeKey();
  return useQuery({
    queryKey: getProfileQueryKey(scopeKey),
    queryFn: ({ signal }) => getProfile(signal),
    enabled: Boolean(getAuthToken()),
    retry: false,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const scopeKey = getAuthScopeKey();
  const profileKey = getProfileQueryKey(scopeKey);

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => updateProfile(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKey, profile);
      queryClient.invalidateQueries({ queryKey: profileKey });
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => changePassword(payload),
  });
}

export function useWalletsQuery() {
  const scopeKey = getAuthScopeKey();
  return useQuery({
    queryKey: getWalletsQueryKey(scopeKey),
    queryFn: ({ signal }) => getWallets(signal),
    enabled: Boolean(getAuthToken()),
    retry: false,
  });
}

export function useCreateWalletMutation() {
  const queryClient = useQueryClient();
  const scopeKey = getAuthScopeKey();
  const walletsKey = getWalletsQueryKey(scopeKey);

  return useMutation({
    mutationFn: (payload: CreateWalletRequest) => createWallet(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletsKey });
    },
  });
}

export function useUpdateWalletMutation() {
  const queryClient = useQueryClient();
  const scopeKey = getAuthScopeKey();
  const walletsKey = getWalletsQueryKey(scopeKey);

  return useMutation({
    mutationFn: ({ walletId, payload }: { walletId: string; payload: UpdateWalletRequest }) =>
      updateWallet(walletId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletsKey });
    },
  });
}
