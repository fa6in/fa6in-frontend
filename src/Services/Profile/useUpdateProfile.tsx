
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { userKey, type UserInfo } from "./useGetProfile";
import api from "../../Auth-service/axios";
import { handleError } from "../../Auth-service/handleError";
import { API_ENDPOINTS } from "../../api/endpoints";

export const useUpdateUser  = () => {
  const querClient = useQueryClient()
    async function updateuser (user : UserInfo){
    const formData = new FormData();
    if (user.username) formData.append("username", user.username);
    if (user.email) formData.append("email", user.email);
    if (user.first_name) formData.append("first_name", user.first_name);
    if (user.last_name) formData.append("last_name", user.last_name);
    if (user.phone_number) formData.append("phone_number", user.phone_number);
    if (user.school) formData.append("school", user.school);

    if (user.profile_image instanceof File) {
        formData.append("profile_image", user.profile_image);
    }
    const res = await api.put(API_ENDPOINTS.auth.profile, formData)
    return res.data
    
    }
    return useMutation({
        mutationFn : updateuser,
        mutationKey : userKey,
        
        onSuccess :(data)=>{
            sessionStorage.setItem('Full_Name_user_Connect', data?.full_name)
            querClient.invalidateQueries({
                queryKey:userKey
            })
        
        message.success(" updated with successfuly");
        },
        onError:(err:any)=>{
            const data = err?.response?.data;
            const fieldError = data && typeof data === "object"
                ? Object.values(data).flat().find((item) => typeof item === "string")
                : undefined;
            return message.error(typeof fieldError === "string" ? fieldError : handleError(err));
        } 
    })
}