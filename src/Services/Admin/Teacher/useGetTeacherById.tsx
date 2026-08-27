import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import type { TeachersResponse } from "./typeTeacher";

export const TEACHER_DETAIL_KEY = ["teacher-detail"];

type TeacherDetail = TeachersResponse extends { results: infer R }
  ? R extends (infer T)[]
    ? T
    : never
  : never;

async function getTeacherById(id: number | string): Promise<TeacherDetail> {
  const res = await api.get(API_ENDPOINTS.auth.adminTeacherDetail(id));
  return res.data;
}

export function useGetTeacherById(id: number | string, enabled = true) {
  return useQuery({
    queryKey: [...TEACHER_DETAIL_KEY, id],
    queryFn: () => getTeacherById(id),
    enabled: enabled && !!id,
  });
}
