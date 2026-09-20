import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { handleError } from "../../Auth-service/handleError";
import type { Chunk } from "./typeSkill";
import { CHUNKS_KEY } from "./useGetChunks";

async function updateChunk(chunk: Chunk) {
  const res = await api.put(`${API_ENDPOINTS.skills.chunks}${chunk.id}/`, chunk);
  return res.data;
}

export function useUpdateChunk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateChunk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHUNKS_KEY });
      message.success("Micro-contenu modifié avec succès");
    },
    onError: (err: unknown) => message.error(handleError(err)),
  });
}