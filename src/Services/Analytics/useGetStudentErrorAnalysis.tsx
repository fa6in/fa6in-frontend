import { useQuery } from "@tanstack/react-query";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";

export const STUDENT_ERROR_ANALYSIS_KEY = ["student-error-analysis"];

export type StudentErrorAnalysisParams = {
  days?: number;
};

async function getStudentErrorAnalysis(
  studentId: number | string,
  params?: StudentErrorAnalysisParams
) {
  const res = await api.get(
    API_ENDPOINTS.analytics.studentErrorAnalysis(studentId),
    { params }
  );
  return res.data;
}

export function useGetStudentErrorAnalysis(
  studentId: number | string,
  params?: StudentErrorAnalysisParams,
  enabled = true
) {
  return useQuery({
    queryKey: [...STUDENT_ERROR_ANALYSIS_KEY, studentId, params],
    queryFn: () => getStudentErrorAnalysis(studentId, params),
    enabled: enabled && !!studentId,
  });
}
