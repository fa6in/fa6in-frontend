import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { handleError } from "../../../Auth-service/handleError";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { KEY_CONTENT } from "./useGetContent";

export function useDeleteContent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contentId }: { unitId?: number|string; contentId: number|string }) =>
            api.delete(API_ENDPOINTS.curriculum.lessonDetail(contentId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: KEY_CONTENT });
            message.success("Contenu supprimé avec succès");
        },
        onError: (error: unknown) => message.error(handleError(error)),
    });
}