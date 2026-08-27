import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { handleError } from "../../Auth-service/handleError";
import type { Chunk } from "./typeSkill";
import { CHUNKS_KEY } from "./useGetChunks";

async function addChunk(chunk: Chunk) {
  const res = await api.post(API_ENDPOINTS.skills.chunks, chunk);
  return res.data;
}

export function useAddChunk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addChunk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHUNKS_KEY });
      message.success("Chunk créé avec succès");
    },
    onError: (err: unknown) => {
      message.error(handleError(err));
    },
  });
}
