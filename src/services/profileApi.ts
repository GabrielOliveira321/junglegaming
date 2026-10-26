import type {
  ChangePasswordRequest,
  CreateWalletRequest,
  Profile,
  UpdateProfileRequest,
  UpdateWalletRequest,
  Wallet,
} from "@/contracts/rest";
import { httpClient } from "@/lib/httpClient";

export async function getProfile(signal?: AbortSignal) {
  const response = await httpClient.get<Profile>("/api/profile", { signal });
  return response.data;
}

export async function updateProfile(payload: UpdateProfileRequest) {
  const response = await httpClient.patch<Profile>("/api/profile", payload);
  return response.data;
}

export async function changePassword(payload: ChangePasswordRequest) {
  const response = await httpClient.post<{ status: "ok" }>("/api/profile/password", payload);
  return response.data;
}

export async function getWallets(signal?: AbortSignal) {
  const response = await httpClient.get<Wallet[]>("/api/wallets", { signal });
  return response.data;
}

export async function createWallet(payload: CreateWalletRequest) {
  const response = await httpClient.post<Wallet>("/api/wallets", payload);
  return response.data;
}

export async function updateWallet(walletId: string, payload: UpdateWalletRequest) {
  const response = await httpClient.patch<Wallet>(`/api/wallets/${walletId}`, payload);
  return response.data;
}
