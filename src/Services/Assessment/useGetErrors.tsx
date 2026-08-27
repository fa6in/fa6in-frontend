import { useQuery } from "@tanstack/react-query";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import type { AssessmentError } from "./typeAssessment";

export const ERRORS_KEY = ["assessment-errors"];

async function getErrors(): Promise<AssessmentError[]> {
  const res = await api.get(API_ENDPOINTS.assessment.errors);
  return res.data?.results ?? res.data;
}

export function useGetErrors() {
  return useQuery({
    queryKey: ERRORS_KEY,
    queryFn: getErrors,
  });
}
