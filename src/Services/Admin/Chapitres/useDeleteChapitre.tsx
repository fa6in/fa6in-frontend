
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { chapitreKey } from "./useGetChapitres";

export const useDeleteChapitre = () => {
    const queryClient = useQueryClient();
    async function deletechapitre({ id }: { id: string | number }) {
        const response = await api.delete(`api/curriculum/subjects/${id}/`);
        return response.data;
    }
    return useMutation({
        mutationFn: deletechapitre,
        onSuccess: () => {
            message.success("chapitre supprimée avec succès");
            queryClient.invalidateQueries({
                queryKey: chapitreKey,
            });
        },
        onError: (err: any) => {
            return message.error(err.message);
        },
    });
};




