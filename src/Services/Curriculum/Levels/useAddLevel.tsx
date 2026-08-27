import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { handleError } from "../../../Auth-service/handleError";
import type { Level } from "./typeLevel";
import { LEVELS_KEY } from "./useGetLevels";

async function addLevel(level: Level) {
  const res = await api.post(API_ENDPOINTS.curriculum.levels, level);
  return res.data;
}

export function useAddLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEVELS_KEY });
      message.success("Niveau créé avec succès");
    },
    onError: (err: unknown) => {
      message.error(handleError(err));
    },
  });
}
