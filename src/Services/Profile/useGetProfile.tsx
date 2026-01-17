

import { useQuery } from "@tanstack/react-query";
import api from "../../Auth-service/axios";

export const userKey = ["user-key"]

export type UserInfo = {
    id?:string,
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    profile_image?: string | null | File;
    role?: string,
    phone_number?: string;
    grade?:number
    school?:string

    date_joined?:string,
    last_login?:string,
    is_active?:string,

    
  };

async function getMe():Promise<UserInfo>{
    try{
        const res = await api.get("api/auth/profile/")
    return res.data
    }catch(error:any){
        if(error.response){
            
        }
        throw error
    }
}

export function useGetProfile(enabled: boolean = true){
    return useQuery({
        queryKey:userKey,
        queryFn:()=>getMe(),
        enabled: enabled
    })
}