

import { useQuery } from "@tanstack/react-query";
import api from "../../Auth-service/axios";

export const TEACHER_KEY = ["dashboard-teacher"]

export type TeacherDashboardType = {
  id: number;
  teacher: number;
  teacher_name: string;
  total_students: number;
  active_students: number;
  total_units_created: number;
  student_engagement_rate: number;
  avg_student_progress: number;
  last_updated: string; // ISO date string
};

async function getdashboard():Promise<TeacherDashboardType>{
    try{
        const res = await api.get("api/analytics/teacher-dashboard/")
    return res.data
    }catch(error:any){
        if(error.response){
            
        }
        throw error
    }
}

export function useGetDashboardTeacher(){
    return useQuery({
        queryKey:TEACHER_KEY,
        queryFn:()=>getdashboard(),
    })
}

