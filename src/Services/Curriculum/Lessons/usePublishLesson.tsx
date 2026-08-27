import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { LESSONS_KEY } from "./useGetLessons";

async function publishLesson(id: number | string) {
  const res = await api.post(API_ENDPOINTS.curriculum.lessonPublish(id));
  return res.data;
}

export function usePublishLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LESSONS_KEY });
      message.success("Leçon publiée avec succès");
    },
    onError: (err: unknown) => {
      message.error((err as Error).message);
    },
  });
}
