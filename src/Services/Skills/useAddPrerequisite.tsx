import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { handleError } from "../../Auth-service/handleError";
import type { Prerequisite } from "./typeSkill";
import { PREREQUISITES_KEY } from "./useGetPrerequisites";

async function addPrerequisite(prerequisite: Prerequisite) {
  const res = await api.post(API_ENDPOINTS.skills.prerequisites, prerequisite);
  return res.data;
}

export function useAddPrerequisite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addPrerequisite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PREREQUISITES_KEY });
      message.success("Prérequis ajouté avec succès");
    },
    onError: (err: unknown) => {
      message.error(handleError(err));
    },
  });
}
