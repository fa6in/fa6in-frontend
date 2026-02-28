





import { useQuery } from "@tanstack/react-query";
import api from "../../Auth-service/axios";

export const OVERVIEW_KEY = ["overview-teacher"]

export type TeacherOverviewType = {
  teacher_info: {
    name: string;
    subjects: string;
    experience: number;
  };
  quick_stats: {
    total_students: number;
    total_units: number;
    published_units: number;
    total_activities: number;
    avg_student_progress: number;
  };
  recent_activity: {
    period: string;
    total_attempts: number;
    unique_students: number;
    top_activities: any[]; // à typer plus précisément si tu as la structure
  };
  upcoming_deadlines: {
    title: string;
    deadline: string; // ISO date (YYYY-MM-DD)
    priority: "low" | "medium" | "high";
  }[];
  notifications: {
    struggling_students: any[]; // à typer si tu as la structure
    old_units: any[]; // à typer si tu as la structure
  };
};

async function getoverview():Promise<TeacherOverviewType>{
    try{
        const res = await api.get("api/analytics/teacher-dashboard/overview/")
    return res.data
    }catch(error:any){
        if(error.response){
            
        }
        throw error
    }
}

export function useGetOverviewDashboardTeacher(){
    return useQuery({
        queryKey:OVERVIEW_KEY,
        queryFn:()=>getoverview(),
    })
}

