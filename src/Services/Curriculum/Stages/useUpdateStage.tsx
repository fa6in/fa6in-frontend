import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { handleError } from "../../../Auth-service/handleError";
import type { Stage } from "./typeStage";
import { STAGES_KEY } from "./useGetStages";

async function updateStage(stage: Stage & { id: number }) {
  const res = await api.put(
    API_ENDPOINTS.curriculum.stageDetail(stage.id),
    stage
  );
  return res.data;
}

export function useUpdateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAGES_KEY });
      message.success("Stage mis à jour avec succès");
    },
    onError: (err: unknown) => {
      message.error(handleError(err));
    },
  });
}
