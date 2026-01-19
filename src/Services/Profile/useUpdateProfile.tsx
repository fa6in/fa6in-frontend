
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { userKey, type UserInfo } from "./useGetProfile";
import api from "../../Auth-service/axios";
import { handleError } from "../../Auth-service/handleError";

export const useUpdateUser  = () => {
  const querClient = useQueryClient()
    async function updateuser (user : UserInfo){
    const formData = new FormData();
    formData.append("username", user?.username!);
    formData.append("first_name", user?.first_name!);
    formData.append("last_name", user?.last_name!);
    formData.append("phone_number", user?.phone_number!);
    // formData.append("grade", String(user?.grade!));
    // formData.append("phone_number", user?.phone_number!);

    if (user?.profile_image) {
        formData.append("profile_image", user?.profile_image);
    }
    const res = await api.put(`api/auth/profile/`, formData)
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
            const messageError = err?.response?.data?.phone_number?.[0]
            const errorMessage2 = handleError(err);

            if(messageError){
            return message.error(messageError)
        } else {
            return message.error(errorMessage2)
            
        }
        } 
    })
}