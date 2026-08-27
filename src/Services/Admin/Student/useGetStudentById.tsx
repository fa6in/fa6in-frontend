import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import type { Student } from "./typeStudent";

export const STUDENT_DETAIL_KEY = ["student-detail"];

async function getStudentById(id: number | string): Promise<Student> {
  const res = await api.get(API_ENDPOINTS.auth.adminStudentDetail(id));
  return res.data;
}

export function useGetStudentById(id: number | string, enabled = true) {
  return useQuery({
    queryKey: [...STUDENT_DETAIL_KEY, id],
    queryFn: () => getStudentById(id),
    enabled: enabled && !!id,
  });
}
