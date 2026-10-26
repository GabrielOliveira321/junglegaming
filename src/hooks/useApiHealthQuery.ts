import { useQuery } from "@tanstack/react-query";
import { getApiHealth } from "@/services/systemApi";

export function useApiHealthQuery() {
  return useQuery({
    queryKey: ["system", "health"],
    queryFn: getApiHealth,
  });
}
