import { httpClient } from "@/lib/httpClient";

export type ApiHealth = {
  status: "ok";
  service: string;
  mode: "mock";
  timestamp: string;
};

export async function getApiHealth() {
  const response = await httpClient.get<ApiHealth>("/api/health");
  return response.data;
}
