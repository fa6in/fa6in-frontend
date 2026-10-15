import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { handleError } from "../../../Auth-service/handleError";
import type { AddPersonne } from "./typeStudent";
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
            const data = err?.response?.data;
            const details = data && typeof data === "object"
                ? Object.values(data).flat().filter((item) => typeof item === "string")
                : [];
            const text = details.length ? details.join(" ") : handleError(err);
            message.error(text);
        }
    });
}

