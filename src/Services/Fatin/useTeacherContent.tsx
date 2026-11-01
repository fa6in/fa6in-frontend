import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { unwrapList } from "../../api/unwrapList";
import { apiErrorText } from "./apiErrorText";
import type {
  CChunk,
  CGoal,
  CLesson,
  CPrerequisite,
  CSkill,
  CUnit,
  PrereqCandidate,
  PublicationCheck,
  StudentErrorRow,
  StudentRow,
  StudentSummary,
  TeacherOverview,
  UnitPerformance,
} from "./types";

export const CONTENT_KEY = ["fatin-content"];
export const TEACHER_STATS_KEY = ["fatin-teacher-stats"];

// L'éditeur charge des listes complètes (la pagination par défaut est de 20).
const ALL = { page_size: 500 };

async function list<T>(url: string, params: Record<string, unknown>): Promise<T[]> {
  return unwrapList<T>((await api.get(url, { params: { ...ALL, ...params } })).data);
}

// ==================== Tableaux de bord ====================

export function useTeacherOverview() {
  return useQuery({
    queryKey: [...TEACHER_STATS_KEY, "overview"],
    queryFn: async (): Promise<TeacherOverview> => (await api.get(API_ENDPOINTS.dashboards.teacherOverview)).data,
  });
}

export function useTeacherStudents() {
  return useQuery({
    queryKey: [...TEACHER_STATS_KEY, "students"],
    queryFn: async (): Promise<StudentRow[]> => unwrapList<StudentRow>((await api.get(API_ENDPOINTS.dashboards.teacherStudents)).data),
  });
}

export function useUnitsPerformance() {
  return useQuery({
    queryKey: [...TEACHER_STATS_KEY, "units"],
    queryFn: async (): Promise<UnitPerformance[]> => unwrapList<UnitPerformance>((await api.get(API_ENDPOINTS.dashboards.teacherUnits)).data),
  });
}

export function useStudentSummary(studentId?: number) {
  return useQuery({
    queryKey: [...TEACHER_STATS_KEY, "summary", studentId],
    queryFn: async (): Promise<StudentSummary> => (await api.get(API_ENDPOINTS.dashboards.studentSummary(studentId!))).data,
    enabled: !!studentId,
  });
}

export function useStudentErrors(studentId?: number) {
  return useQuery({
    queryKey: [...TEACHER_STATS_KEY, "errors", studentId],
    queryFn: async (): Promise<StudentErrorRow[]> =>
      unwrapList<StudentErrorRow>((await api.get(API_ENDPOINTS.dashboards.studentErrors(studentId!), { params: { days: 90 } })).data),
    enabled: !!studentId,
  });
}

// ==================== Contenu (T2 → T9) ====================

export function useContentUnits() {
  return useQuery({
    queryKey: [...CONTENT_KEY, "units"],
    queryFn: () => list<CUnit>(API_ENDPOINTS.curriculum.units, {}),
  });
}

export function useContentUnit(unitId?: number | null) {
  return useQuery({
    queryKey: [...CONTENT_KEY, "unit", unitId],
    queryFn: async (): Promise<CUnit> => (await api.get(API_ENDPOINTS.content.unitDetail(unitId!))).data,
    enabled: !!unitId,
  });
}

export function useContentLessons(unitId?: number | null) {
  return useQuery({
    queryKey: [...CONTENT_KEY, "lessons", unitId],
    queryFn: () => list<CLesson>(API_ENDPOINTS.curriculum.lessons, { unit: unitId }),
    enabled: !!unitId,
  });
}

export function useContentGoals(lessonId?: number | null) {
  return useQuery({
    queryKey: [...CONTENT_KEY, "goals", lessonId],
    queryFn: () => list<CGoal>(API_ENDPOINTS.curriculum.goals, { lesson: lessonId }),
    enabled: !!lessonId,
  });
}

export function useContentSkills(lessonId?: number | null) {
  return useQuery({
    queryKey: [...CONTENT_KEY, "skills", lessonId],
    queryFn: () => list<CSkill>(API_ENDPOINTS.skills.skills, { goal__lesson: lessonId }),
    enabled: !!lessonId,
  });
}

export function useContentChunks(lessonId?: number | null) {
  return useQuery({
    queryKey: [...CONTENT_KEY, "chunks", lessonId],
    queryFn: () => list<CChunk>(API_ENDPOINTS.skills.chunks, { skill__goal__lesson: lessonId }),
    enabled: !!lessonId,
  });
}

export function useContentPrerequisites(lessonId?: number | null) {
  return useQuery({
    queryKey: [...CONTENT_KEY, "prerequisites", lessonId],
    queryFn: () => list<CPrerequisite>(API_ENDPOINTS.skills.prerequisites, { skill__goal__lesson: lessonId }),
    enabled: !!lessonId,
  });
}

export function usePrerequisiteCandidates(skillId: number | null, search: string) {
  return useQuery({
    queryKey: [...CONTENT_KEY, "prerequisite-candidates", skillId, search],
    queryFn: async (): Promise<PrereqCandidate[]> =>
      (await api.get(API_ENDPOINTS.content.prerequisiteCandidates(skillId!), { params: search ? { search } : {} })).data,
    enabled: !!skillId,
  });
}

export function usePublicationCheck(lessonId?: number | null) {
  return useQuery({
    queryKey: [...CONTENT_KEY, "publication-check", lessonId],
    queryFn: async (): Promise<PublicationCheck> => (await api.get(API_ENDPOINTS.content.lessonCheck(lessonId!))).data,
    enabled: !!lessonId,
  });
}

type ContentRequest = {
  method: "post" | "patch" | "delete";
  url: string;
  data?: unknown;
  success?: string;
};

/**
 * Écriture générique de l'éditeur de contenu : chaque étape du
 * wizard enchaîne des créations / modifications sur des ressources
 * différentes, puis toutes les listes de contenu sont rafraîchies.
 */
export function useContentSave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ method, url, data }: ContentRequest) => (await api.request({ method, url, data })).data,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CONTENT_KEY });
      if (variables.success) message.success(variables.success);
    },
    onError: (error) => message.error(apiErrorText(error)),
  });
}
