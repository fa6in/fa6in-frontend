import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { handleError } from "../../../Auth-service/handleError";
import type { Lesson } from "./typeLesson";
import { LESSONS_KEY } from "./useGetLessons";

async function addLesson(lesson: Lesson) {
  const res = await api.post(API_ENDPOINTS.curriculum.lessons, lesson);
  return res.data;
}

export function useAddLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LESSONS_KEY });
      message.success("Leçon créée avec succès");
    },
    onError: (err: unknown) => {
      message.error(handleError(err));
    },
  });
}
