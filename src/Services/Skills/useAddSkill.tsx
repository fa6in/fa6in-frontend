import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { handleError } from "../../Auth-service/handleError";
import type { Skill } from "./typeSkill";
import { SKILLS_KEY } from "./useGetSkills";

async function addSkill(skill: Skill) {
  const res = await api.post(API_ENDPOINTS.skills.skills, skill);
  return res.data;
}

export function useAddSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_KEY });
      message.success("Compétence créée avec succès");
    },
    onError: (err: unknown) => {
      message.error(handleError(err));
    },
  });
}
