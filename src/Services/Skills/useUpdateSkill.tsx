import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { handleError } from "../../Auth-service/handleError";
import type { Skill } from "./typeSkill";
import { SKILLS_KEY } from "./useGetSkills";

async function updateSkill(skill: Skill) {
  const { id, ...payload } = skill;
  const res = await api.put(`${API_ENDPOINTS.skills.skills}${id}/`, payload);
  return res.data;
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_KEY });
      message.success("Compétence modifiée avec succès");
    },
    onError: (err: unknown) => {
      message.error(handleError(err));
    },
  });
}