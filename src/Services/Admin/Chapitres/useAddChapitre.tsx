




import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { handleError } from "../../../Auth-service/handleError";
import type { typeChapitre } from "./typeChapitre";
import { chapitreKey } from "./useGetChapitres";

export const useAddChapitre = () => {
    const queryClient = useQueryClient();

    async function addchapitre(chapitre: typeChapitre) {
        const formData = new FormData();


        formData.append("subject", chapitre.subject ? String(chapitre.subject) : "");
        formData.append("code", chapitre.code ? chapitre.code : "");
        formData.append("title", chapitre.title ? chapitre.title : "");
        formData.append("description", chapitre.description ? chapitre.description : "");
        formData.append("learning_objective", chapitre.learning_objective ? chapitre.learning_objective : "");
        formData.append("difficulty", chapitre.difficulty ? chapitre.difficulty : "");
        formData.append("order", chapitre.order ? String(chapitre.order) : "0");
        formData.append("duration_minutes", chapitre.duration_minutes ? String(chapitre.duration_minutes) : "0");

        if (chapitre.thumbnail) {
            formData.append("thumbnail", chapitre.thumbnail);

        }
        formData.append("video_url", chapitre?.video_url! ? chapitre?.video_url! : "");
        formData.append("audio_url", chapitre?.audio_url! ? chapitre?.audio_url! : "");
        formData.append("is_published", String(chapitre?.is_published!));




        const res = await api.post(`api/curriculum/units/`, formData);
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
