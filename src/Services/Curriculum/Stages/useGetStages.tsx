import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { unwrapList } from "../../../api/unwrapList";
import type { Stage } from "./typeStage";

export const STAGES_KEY = ["stages"];

async function getStages(): Promise<Stage[]> {
  const res = await api.get(API_ENDPOINTS.curriculum.stages);
  return unwrapList<Stage>(res.data);
}

export function useGetStages() {
  return useQuery({
    queryKey: STAGES_KEY,
    queryFn: getStages,
  });
}
