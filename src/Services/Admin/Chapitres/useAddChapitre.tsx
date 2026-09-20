




import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { handleError } from "../../../Auth-service/handleError";
import type { typeChapitre } from "./typeChapitre";
import { chapitreKey } from "./useGetChapitres";

export const useAddChapitre = () => {
    const queryClient = useQueryClient();

    async function addchapitre(chapitre: typeChapitre) {
        const res = await api.post(`api/curriculum/units/`, {
            code: chapitre.code,
            title: chapitre.title,
            subject: chapitre.subject,
            central_question: chapitre.central_question,
            order_index: chapitre.order_index,
            is_published: chapitre.is_published,
        });
        return res.data;
    }

    return useMutation({
        mutationFn: addchapitre,
        mutationKey: chapitreKey,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: chapitreKey
            });
            // message.success("chapitre ajouté avec succès");
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
