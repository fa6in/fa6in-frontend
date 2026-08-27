import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { handleError } from "../../../Auth-service/handleError";
import type { Goal } from "./typeGoal";
import { GOALS_KEY } from "./useGetGoals";

async function addGoal(goal: Goal) {
  const res = await api.post(API_ENDPOINTS.curriculum.goals, goal);
  return res.data;
}

export function useAddGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
      message.success("Objectif créé avec succès");
    },
    onError: (err: unknown) => {
      message.error(handleError(err));
    },
  });
}
