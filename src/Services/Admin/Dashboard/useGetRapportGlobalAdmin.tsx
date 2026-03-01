
import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import type { AdminAnalyticsType } from "./type";

export const ADMIN_DASHBOARD_KEY = ["dashboard-admin"]

async function getdashboard():Promise<AdminAnalyticsType>{
    try{
        const res = await api.get("api/analytics/reports/")
    return res.data
    }catch(error:any){
        if(error.response){            
        }
        throw error
    }
}

export function useGetRapportGlobalAdmin(){
    return useQuery({
        queryKey:ADMIN_DASHBOARD_KEY,
        queryFn:()=>getdashboard(),
    })
}
