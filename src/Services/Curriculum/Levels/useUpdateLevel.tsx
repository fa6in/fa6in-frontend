import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { handleError } from "../../../Auth-service/handleError";
import type { Level } from "./typeLevel";
import { LEVELS_KEY } from "./useGetLevels";

async function updateLevel(level: Level & { id: number }) {
  const res = await api.put(
    API_ENDPOINTS.curriculum.levelDetail(level.id),
    level
  );
  return res.data;
}

export function useUpdateLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEVELS_KEY });
      message.success("Niveau mis à jour avec succès");
    },
    onError: (err: unknown) => {
      message.error(handleError(err));
    },
  });
}
