import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../Auth-service/axios";
import AuthService from "../../Auth-service/AuthService";
import { API_ENDPOINTS } from "../../api/endpoints";
import type { NextAction, ProgressSummary, SkillMap, StudentHome, StudentPath, SubmitResult } from "./types";

// Toutes les données de parcours dépendent de la maîtrise : on les
// invalide ensemble après chaque réponse.
export const STUDENT_LEARNING_KEY = ["student-learning"];

const me = () => AuthService.getUserId() ?? "";

export function useStudentHome() {
  return useQuery({
    queryKey: [...STUDENT_LEARNING_KEY, "home"],
    queryFn: async (): Promise<StudentHome> => (await api.get(API_ENDPOINTS.student.home(me()))).data,
  });
}

export function useStudentPath(subjectId?: number) {
  return useQuery({
    queryKey: [...STUDENT_LEARNING_KEY, "path", subjectId ?? null],
    queryFn: async (): Promise<StudentPath> =>
      (await api.get(API_ENDPOINTS.student.path(me()), { params: subjectId ? { subject: subjectId } : {} })).data,
  });
}

export function useSkillMap(unitId?: number) {
  return useQuery({
    queryKey: [...STUDENT_LEARNING_KEY, "skill-map", unitId],
    queryFn: async (): Promise<SkillMap> =>
      (await api.get(API_ENDPOINTS.student.skillMap(me()), { params: { unit: unitId } })).data,
    enabled: !!unitId,
  });
}

export function useProgressSummary() {
  return useQuery({
    queryKey: [...STUDENT_LEARNING_KEY, "progress-summary"],
    queryFn: async (): Promise<ProgressSummary> => (await api.get(API_ENDPOINTS.student.progressSummary(me()))).data,
  });
}

// next-action fait avancer l'onboarding côté serveur (rule_seen /
// example_seen) : c'est une mutation, pas une simple lecture.
export function useNextAction() {
  return useMutation({
    mutationFn: async (skillId: number): Promise<NextAction> =>
      (await api.get(API_ENDPOINTS.student.nextAction(me()), { params: { skill: skillId } })).data,
  });
}

export function useSubmitAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { chunk_id: number; answer: string; time_taken: number }): Promise<SubmitResult> =>
      (await api.post(API_ENDPOINTS.student.answer(me()), body)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STUDENT_LEARNING_KEY }),
  });
}
