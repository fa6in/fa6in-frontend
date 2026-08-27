import { useQuery, type QueryClient } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { unwrapList } from "../../../api/unwrapList";

export const WILAYA_KEY = ["wilaya"];

export type WilayaTYpe = {
  id: number;
  code: number;
  name: string;
};

async function getWilaya(): Promise<WilayaTYpe[]> {
  const res = await api.get(API_ENDPOINTS.auth.wilayas);
  return unwrapList<WilayaTYpe>(res.data);
}

export async function refreshWilayas(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: WILAYA_KEY });
  await queryClient.refetchQueries({ queryKey: WILAYA_KEY, type: "all" });
}

export function useGetWilaya() {
  return useQuery({
    queryKey: WILAYA_KEY,
    queryFn: getWilaya,
    refetchOnMount: "always",
  });
}
