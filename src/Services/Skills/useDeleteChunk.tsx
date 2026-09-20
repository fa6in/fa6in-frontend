import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { CHUNKS_KEY } from "./useGetChunks";

export function useDeleteChunk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(`${API_ENDPOINTS.skills.chunks}${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHUNKS_KEY });
      message.success("Micro-contenu supprimé avec succès");
    },
    onError: () => message.error("La suppression a échoué"),
  });
}