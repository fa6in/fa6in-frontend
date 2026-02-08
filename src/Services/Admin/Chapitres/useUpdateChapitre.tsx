
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { handleError } from "../../../Auth-service/handleError";
import type { typeChapitre } from "./typeChapitre";
import { chapitreKey } from "./useGetChapitres";

export const useUpdateChapitre = () => {
    const queryClient = useQueryClient();

    async function updatechapitre(chapitre: typeChapitre) {
        const formData = new FormData();

        formData.append("subject", String(chapitre.subject));
        formData.append("title", chapitre.title);
        formData.append("description", chapitre.description);
        formData.append("learning_objective", chapitre.learning_objective);
        formData.append("duration_minutes", String(chapitre.duration_minutes));
        formData.append("difficulty", chapitre.difficulty);
        formData.append("order", String(chapitre.order));

        if (chapitre.thumbnail && chapitre?.thumbnail! instanceof File) {
            formData.append("thumbnail", chapitre.thumbnail);
        }
        formData.append("video_url", chapitre?.video_url!);
        formData.append("audio_url", chapitre?.audio_url!);
        formData.append("is_published", String(chapitre?.is_published!));

        const res = await api.put(`api/curriculum/units/${chapitre?.id}/`, formData);
        return res.data;
    }

    return useMutation({
        mutationFn: updatechapitre,
        mutationKey: chapitreKey,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: chapitreKey
            });
            // message.success("matiere ajouté avec succès");
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
