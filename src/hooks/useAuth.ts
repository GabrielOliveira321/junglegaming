import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { clearAuthToken, getAuthScopeKey, getAuthToken, setAuthToken } from "@/lib/authToken";
import { getSession, loginAccount, logoutAccount, registerAccount } from "@/services/authApi";
import type { ApiErrorResponse, LoginRequest, RegisterRequest } from "@/contracts/rest";

function extractApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiErrorResponse | undefined)?.error?.message ?? fallback;
  }
  return fallback;
}

export function useSessionQuery() {
  const scopeKey = getAuthScopeKey();
  const sessionKey = ["auth", "session", scopeKey];

  return useQuery({
    queryKey: sessionKey,
    queryFn: getSession,
    retry: false,
    enabled: Boolean(getAuthToken()),
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterRequest) => registerAccount(payload),
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginRequest) => loginAccount(payload),
    onSuccess: (data) => {
      setAuthToken(data.token);
      const scopeKey = getAuthScopeKey();
      queryClient.invalidateQueries({ queryKey: ["auth", "session", scopeKey] });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutAccount,
    onSettled: () => {
      clearAuthToken();
      queryClient.clear();
    },
  });
}

export function useAuthErrorMessage() {
  return { extractApiErrorMessage };
}
