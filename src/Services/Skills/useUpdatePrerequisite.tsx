import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { handleError } from "../../Auth-service/handleError";
import type { Prerequisite } from "./typeSkill";
import { PREREQUISITES_KEY } from "./useGetPrerequisites";

async function updatePrerequisite(prerequisite: Prerequisite) {
  const { id, ...payload } = prerequisite;
  const res = await api.put(`${API_ENDPOINTS.skills.prerequisites}${id}/`, payload);
  return res.data;
}

export function useUpdatePrerequisite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePrerequisite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PREREQUISITES_KEY });
      message.success("Prérequis modifié avec succès");
    },
    onError: (err: unknown) => message.error(handleError(err)),
  });
}