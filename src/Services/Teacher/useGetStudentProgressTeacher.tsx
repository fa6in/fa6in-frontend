import { useQuery } from "@tanstack/react-query";
import api from "../../Auth-service/axios";

export const STUDENT_PROGRESS_KEY = ["student-progress-teacher"];

export type TeacherStudentProgress = {
  student_id: number;
  username: string;
  first_name: string;
  last_name: string;
  skills_started: number;
  skills_mastered: number;
  average_mastery: number;
  last_active: string | null;
};

export function studentDisplayName(student: Pick<TeacherStudentProgress, "first_name" | "last_name" | "username">) {
  const name = [student.first_name, student.last_name].filter(Boolean).join(" ").trim();
  return name || student.username;
}

async function getProgress(): Promise<TeacherStudentProgress[]> {
  const res = await api.get("api/analytics/teacher-dashboard/students-progress/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? res.data?.students_progress ?? [];
}

export function useGetStudentProgressTeacher() {
  return useQuery({
    queryKey: STUDENT_PROGRESS_KEY,
    queryFn: getProgress,
  });
}
