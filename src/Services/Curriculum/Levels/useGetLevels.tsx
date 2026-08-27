import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { unwrapList } from "../../../api/unwrapList";
import type { Level } from "./typeLevel";

export const LEVELS_KEY = ["levels"];

async function getLevels(): Promise<Level[]> {
  const res = await api.get(API_ENDPOINTS.curriculum.levels);
  return unwrapList<Level>(res.data);
}

export function useGetLevels() {
  return useQuery({
    queryKey: LEVELS_KEY,
    queryFn: getLevels,
  });
}
