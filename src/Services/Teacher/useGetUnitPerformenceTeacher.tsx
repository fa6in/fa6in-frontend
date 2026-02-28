



import { useQuery } from "@tanstack/react-query";
import api from "../../Auth-service/axios";

export const PERFORMENCE_UNIT_TEACHER_KEY = ["performence-unit-teacher"]

export type TeacherUnitsPerformanceType = {
  teacher: string;
  total_units: number;
  units_performance: {
    unit_id: number;
    unit_title: string;
    subject: string;
    difficulty: "easy" | "medium" | "hard";
    is_published: boolean;
    created_at: string; // YYYY-MM-DD
    students_count: number;
    completed_count: number;
    completion_rate: number;
    average_progress: number;
    average_score: number;
    total_activities: number;
    total_attempts: number;
  }[];
};

async function getperformence():Promise<TeacherUnitsPerformanceType>{
    try{
        const res = await api.get("api/analytics/teacher-dashboard/units-performance/")
    return res.data
    }catch(error:any){
        if(error.response){
            
        }
        throw error
    }
}

export function useGetUnitsPerformanceTeacher(){
    return useQuery({
        queryKey:PERFORMENCE_UNIT_TEACHER_KEY,
        queryFn:()=>getperformence(),
    })
}

