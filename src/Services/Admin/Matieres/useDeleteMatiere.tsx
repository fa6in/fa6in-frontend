
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { matiereKey } from "./useGetMatiere";
import api from "../../../Auth-service/axios";

export const usedeleteMatiere = () => {
    const queryClient = useQueryClient();
    async function deleteMatiere({ id }: { id: string | number }) {
        const response = await api.delete(`api/curriculum/subjects/${id}/`);
        return response.data;
    }
    return useMutation({
        mutationFn: deleteMatiere,
        onSuccess: () => {
            message.success("Matiere supprimée avec succès");
            queryClient.invalidateQueries({
                queryKey: matiereKey,
            });
        },
        onError: (err: any) => {
            return message.error(err.message);
        },
    });
};




