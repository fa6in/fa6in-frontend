import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { SKILLS_KEY } from "./useGetSkills";

export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(`${API_ENDPOINTS.skills.skills}${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_KEY });
      message.success("Compétence supprimée avec succès");
    },
    onError: () => message.error("La suppression a échoué"),
  });
}