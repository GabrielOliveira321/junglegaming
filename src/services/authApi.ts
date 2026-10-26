import { httpClient } from "@/lib/httpClient";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SessionResponse,
} from "@/contracts/rest";

export async function registerAccount(payload: RegisterRequest) {
  const response = await httpClient.post("/api/auth/register", payload);
  return response.data;
}

export async function loginAccount(payload: LoginRequest) {
  const response = await httpClient.post<AuthResponse>("/api/auth/login", payload);
  return response.data;
}

export async function getSession() {
  const response = await httpClient.get<SessionResponse>("/api/auth/session");
  return response.data;
}

export async function logoutAccount() {
  const response = await httpClient.post("/api/auth/logout");
  return response.data;
}
