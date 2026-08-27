import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { STAGES_KEY } from "./useGetStages";

async function deleteStage(id: number | string) {
  const res = await api.delete(API_ENDPOINTS.curriculum.stageDetail(id));
  return res.data;
}

export function useDeleteStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAGES_KEY });
      message.success("Stage supprimé avec succès");
    },
    onError: (err: unknown) => {
      message.error((err as Error).message);
    },
  });
}
