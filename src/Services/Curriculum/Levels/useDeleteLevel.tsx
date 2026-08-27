import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { LEVELS_KEY } from "./useGetLevels";

async function deleteLevel(id: number | string) {
  const res = await api.delete(API_ENDPOINTS.curriculum.levelDetail(id));
  return res.data;
}

export function useDeleteLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEVELS_KEY });
      message.success("Niveau supprimé avec succès");
    },
    onError: (err: unknown) => {
      message.error((err as Error).message);
    },
  });
}
