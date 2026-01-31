


import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { handleError } from "../../../Auth-service/handleError";
import type { AddTeacher } from "./typeTeacher";
import { TEACHER_KEY } from "./useGetTeacher";

export const useAddTeacher = () => {
    const queryClient = useQueryClient();

    async function addTeacher(personne: AddTeacher) {

        const res = await api.post(`api/auth/register/`, personne);
        return res.data;
    }

    return useMutation({
        mutationFn: addTeacher,
        mutationKey: TEACHER_KEY,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: TEACHER_KEY
            });
            message.success("teacher ajouté avec succès");
        },
        onError: (err: any) => {
            const messageError = err?.response?.data?.logo[0]


            if (messageError) {
                return message.error(messageError);
            }
            handleError(err);
        }
    });
}

