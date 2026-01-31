import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { handleError } from "../../../Auth-service/handleError";
import type { AddPersonne } from "./typeStudent";
import { enqueueSnackbar } from "notistack";
import { STUDENT_KEY } from "./useGetStudents";

export const useAddStudent = () => {
    const queryClient = useQueryClient();

    async function addstudent(personne: AddPersonne) {

        const res = await api.post(`api/auth/register/`, personne);
        return res.data;
    }

    return useMutation({
        mutationFn: addstudent,
        mutationKey: STUDENT_KEY,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: STUDENT_KEY
            });
            message.success("student ajouté avec succès");
        },
        onError: (err: any) => {
            const messageError = err?.response?.data?.username?.[0]!

            if (messageError) {
                enqueueSnackbar(messageError, { variant: "error" });
            } else {
                handleError(err);

            }
        }
    });
}

