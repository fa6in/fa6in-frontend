import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { PREREQUISITES_KEY } from "./useGetPrerequisites";

export function useDeletePrerequisite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(`${API_ENDPOINTS.skills.prerequisites}${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PREREQUISITES_KEY });
      message.success("Prérequis supprimé avec succès");
    },
    onError: () => message.error("La suppression a échoué"),
  });
}