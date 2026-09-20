
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { handleError } from "../../../Auth-service/handleError";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { KEY_CONTENT } from "./useGetContent";
import type { TypeContent } from "./typeContent";
import { getContentUnitId } from "./typeContent";

export const useUpdateContent = () => {
    const queryClient = useQueryClient();

    async function updatecontent(content: TypeContent) {

        console.log("content in useUpdateContent:", content);

        const unitId = getContentUnitId(content.unit);
        const { id: _id, ...payload } = content;
        const res = await api.put(API_ENDPOINTS.curriculum.lessonDetail(_id!), {
            code: payload.code,
            title: payload.title,
            unit: unitId,
            content: payload.content,
            is_published: payload.is_published,
        });
        return res.data;
    }

    return useMutation({
        mutationFn: updatecontent,
        mutationKey: KEY_CONTENT,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: KEY_CONTENT
            });
            message.success("content updated with success!");
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



