import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import type { Lesson } from "./typeLesson";

export const LESSON_DETAIL_KEY = ["lesson-detail"];

async function getLessonById(id: number | string): Promise<Lesson> {
  const res = await api.get(API_ENDPOINTS.curriculum.lessonDetail(id));
  return res.data;
}

export function useGetLessonById(id: number | string, enabled = true) {
  return useQuery({
    queryKey: [...LESSON_DETAIL_KEY, id],
    queryFn: () => getLessonById(id),
    enabled: enabled && !!id,
  });
}
