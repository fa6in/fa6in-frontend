import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { handleError } from "../../../Auth-service/handleError";
import type { Lesson } from "./typeLesson";
import { LESSONS_KEY } from "./useGetLessons";
import { LESSON_DETAIL_KEY } from "./useGetLessonById";

async function updateLesson(lesson: Lesson & { id: number }) {
  const res = await api.put(
    API_ENDPOINTS.curriculum.lessonDetail(lesson.id),
    lesson
  );
  return res.data;
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LESSONS_KEY });
      queryClient.invalidateQueries({ queryKey: LESSON_DETAIL_KEY });
      message.success("Leçon mise à jour avec succès");
    },
    onError: (err: unknown) => {
      message.error(handleError(err));
    },
  });
}
