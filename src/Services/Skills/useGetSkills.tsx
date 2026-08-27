import { useQuery } from "@tanstack/react-query";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import type { Skill } from "./typeSkill";

export const SKILLS_KEY = ["skills"];

async function getSkills(): Promise<Skill[]> {
  const res = await api.get(API_ENDPOINTS.skills.skills);
  return res.data?.results ?? res.data;
}

export function useGetSkills() {
  return useQuery({
    queryKey: SKILLS_KEY,
    queryFn: getSkills,
  });
}
