

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { handleError } from "../../../Auth-service/handleError";
import type { Activitytype } from "./typeAssignement";
import { ASSIGNEMENT_KEY } from "./useGetAssignement";

export const useAddActivite = () => {
    const queryClient = useQueryClient();

    async function addactivite(activite: Activitytype) {
        const res = await api.post(`/api/assessment/levels/${activite?.level}/activities/`, activite);
        return res.data;
    }

    return useMutation({
        mutationFn: addactivite,
        mutationKey: ASSIGNEMENT_KEY,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ASSIGNEMENT_KEY
            });
            // message.success("matiere ajouté avec succès");
        },
        onError: (err: any) => {

            message.error(handleError(err));
        },
        // Ajout du onSettled pour reset l'état loading
        onSettled: () => {
            // Cette fonction s'exécute après que la mutation soit terminée (succès ou erreur)
            // Ce n'est pas obligatoire mais peut être utile pour nettoyer
        }
    });
}