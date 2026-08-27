import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { handleError } from "../../../Auth-service/handleError";
import type { Stage } from "./typeStage";
import { STAGES_KEY } from "./useGetStages";

async function addStage(stage: Stage) {
  const res = await api.post(API_ENDPOINTS.curriculum.stages, stage);
  return res.data;
}

export function useAddStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAGES_KEY });
      message.success("Stage créé avec succès");
    },
    onError: (err: unknown) => {
      message.error(handleError(err));
    },
  });
}
