
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { handleError } from "../../../Auth-service/handleError";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { KEY_CONTENT } from "./useGetContent";
import type { TypeContent } from "./typeContent";
import { getContentUnitId } from "./typeContent";

export const useAddContent = () => {
    const queryClient = useQueryClient();

    async function addcontent(content: TypeContent) {

        const unitId = getContentUnitId(content.unit);
        const { id: _id, ...payload } = content;
        const res = await api.post(API_ENDPOINTS.curriculum.lessons, {
            code: payload.code,
            title: payload.title,
            unit: unitId,
            content: payload.content,
            is_published: payload.is_published,
        });
        return res.data;
    }

    return useMutation({
        mutationFn: addcontent,
        mutationKey: KEY_CONTENT,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: KEY_CONTENT
            });
            message.success("contenu ajouté avec succès");
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



