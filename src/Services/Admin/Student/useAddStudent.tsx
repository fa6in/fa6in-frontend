import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { handleError } from "../../../Auth-service/handleError";
import type { AddPersonne } from "./typeStudent";

export const useAddStudent = () => {
    const queryClient = useQueryClient();

    async function addstudent(personne: AddPersonne) {

        const res = await api.post(`api/auth/register/`, personne);
        return res.data;
    }

    return useMutation({
        mutationFn: addstudent,
        mutationKey: [],

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: []
            });
            message.success("student ajouté avec succès");
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

