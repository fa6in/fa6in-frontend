
import { useQuery } from "@tanstack/react-query";
import api from "../../Auth-service/axios";

export const STUDENT_PROGRESS_KEY = ["student-progress-teacher"]

export type TeacherStudentsProgressType = {
    teacher: string;
    total_students: number;
    students_progress: {
        student_info: {
            id: number;
            name: string;
            username: string;
            grade: number;
        };
        units_progress: {
            unit_id: number;
            unit_title: string;
            progress_percentage: number;
            mastery_level: "beginner" | "intermediate" | "advanced";
            score: number;
            last_accessed: string; // ISO date string
        }[];
        total_score: number;
        average_progress: number;
        units_count: number;
    }[];
};

async function getProgress(): Promise<TeacherStudentsProgressType> {
    try {
        const res = await api.get("api/analytics/teacher-dashboard/students-progress/")
        return res.data
    } catch (error: any) {
        if (error.response) {
        }
        throw error
    }
}

export function useGetStudentProgressTeacher() {
    return useQuery({
        queryKey: STUDENT_PROGRESS_KEY,
        queryFn: () => getProgress(),
    })
}

