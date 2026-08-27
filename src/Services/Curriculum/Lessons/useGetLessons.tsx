import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { unwrapList } from "../../../api/unwrapList";
import type { Lesson } from "./typeLesson";

export const LESSONS_KEY = ["lessons"];

async function getLessons(): Promise<Lesson[]> {
  const res = await api.get(API_ENDPOINTS.curriculum.lessons);
  return unwrapList<Lesson>(res.data);
}

export function useGetLessons() {
  return useQuery({
    queryKey: LESSONS_KEY,
    queryFn: getLessons,
  });
}
