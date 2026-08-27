import { useQuery } from "@tanstack/react-query";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import type { ProgressParams } from "./typeAssessment";

export const PROGRESS_KEY = ["assessment-progress"];

async function getProgress(params?: ProgressParams) {
  const res = await api.get(API_ENDPOINTS.assessment.progress, { params });
  return res.data;
}

export function useGetProgress(params?: ProgressParams) {
  return useQuery({
    queryKey: [...PROGRESS_KEY, params],
    queryFn: () => getProgress(params),
  });
}
