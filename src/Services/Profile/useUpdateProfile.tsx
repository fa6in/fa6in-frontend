







import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { userKey, type UserInfo } from "./useGetProfile";
import api from "../../Auth-service/axios";
import { handleError } from "../../Auth-service/handleError";

export const useUpdateUser  = () => {
  const querClient = useQueryClient()
    async function updateuser (user : UserInfo){
    // const formData = new FormData();
    // formData.append("full_name", user?.first_name!);
    // formData.append("email", user?.email!);
    // formData.append("phone_number", user?.phone_number!);
    // if (user.image) {
    //     formData.append("image", user?.image);
    // }
    const res = await api.put(`api/auth/profile/`, user)
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