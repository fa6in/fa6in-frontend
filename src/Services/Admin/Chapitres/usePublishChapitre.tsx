
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { chapitreKey } from "./useGetChapitres";

export const usePublishChapitre = () => {
    const queryClient = useQueryClient();
    async function publishchapitre({ id }: { id: string | number }) {
        const response = await api.post(`api/curriculum/units/${id}/publish/`);
        return response.data;
    }
    return useMutation({
        mutationFn: publishchapitre,
        onSuccess: () => {
            message.success("chapitre published avec succès");
            queryClient.invalidateQueries({
                queryKey: chapitreKey,
            });
        },
        onError: (err: any) => {
            return message.error(err.message);
        },
    });
};




