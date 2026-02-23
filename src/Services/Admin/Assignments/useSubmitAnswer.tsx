




import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { handleError } from "../../../Auth-service/handleError";
import { ASSIGNEMENT_KEY } from "./useGetAssignement";
import { CONSULT_RESPONSE_KEY } from "./useConsultReponseEtudiant";

export type SubmitAnswerParams = {
    answer : string;
    time_taken: number;
    id: number;
}
export const useSubmitAnswer = () => {
    const queryClient = useQueryClient();

    async function submitAnswer(submit: SubmitAnswerParams) {
        const res = await api.post(`/api/assessment/submit/activity/${submit?.id}/`, submit);
        return res.data;
    }

    return useMutation({
        mutationFn: submitAnswer,
        mutationKey: ASSIGNEMENT_KEY,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ASSIGNEMENT_KEY
            });
              queryClient.invalidateQueries({
                queryKey: CONSULT_RESPONSE_KEY
            });
            // message.success("matiere ajouté avec succès");
        },
        onError: (err: any) => {
            const student = err?.response?.data?.error;
            if (student) {
                message.error(student);
                return;
            }

            return message.error(handleError(err));
        },
        // Ajout du onSettled pour reset l'état loading
        onSettled: () => {
        
        }
    });
}