import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { unwrapList } from "../../../api/unwrapList";
import type { Goal } from "./typeGoal";

export const GOALS_KEY = ["goals"];

async function getGoals(): Promise<Goal[]> {
  const res = await api.get(API_ENDPOINTS.curriculum.goals);
  return unwrapList<Goal>(res.data).map((goal) => ({
    ...goal,
    code: typeof goal.lesson === "object" ? goal.lesson?.code : goal.code,
  }));
}

export function useGetGoals() {
  return useQuery({
    queryKey: GOALS_KEY,
    queryFn: getGoals,
  });
}
