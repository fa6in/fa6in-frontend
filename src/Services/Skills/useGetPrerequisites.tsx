import { useQuery } from "@tanstack/react-query";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import type { Prerequisite } from "./typeSkill";

export const PREREQUISITES_KEY = ["prerequisites"];

async function getPrerequisites(): Promise<Prerequisite[]> {
  const res = await api.get(API_ENDPOINTS.skills.prerequisites);
  return res.data?.results ?? res.data;
}

export function useGetPrerequisites() {
  return useQuery({
    queryKey: PREREQUISITES_KEY,
    queryFn: getPrerequisites,
  });
}
