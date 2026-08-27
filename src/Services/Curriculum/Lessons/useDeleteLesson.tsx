import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { LESSONS_KEY } from "./useGetLessons";

async function deleteLesson(id: number | string) {
  const res = await api.delete(API_ENDPOINTS.curriculum.lessonDetail(id));
  return res.data;
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LESSONS_KEY });
      message.success("Leçon supprimée avec succès");
    },
    onError: (err: unknown) => {
      message.error((err as Error).message);
    },
  });
}
