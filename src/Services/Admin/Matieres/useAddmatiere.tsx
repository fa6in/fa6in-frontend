import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { handleError } from "../../../Auth-service/handleError";
import type { typeMatiere } from "./typeMatiere";
import { matiereKey } from "./useGetMatiere";
import { enqueueSnackbar } from "notistack";

export const useAddMatiere = () => {
    const queryClient = useQueryClient();

    async function addmatiere(matiere: typeMatiere) {
        const res = await api.post(`api/curriculum/subjects/`, matiere);
        return res.data;
    }

    return useMutation({
        mutationFn: addmatiere,
        mutationKey: matiereKey,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: matiereKey
            });
            // message.success("matiere ajouté avec succès");
        },
        onError: (err: any) => {
            console.log("err : ", err?.response?.data?.non_field_errors?.[0]!)
            const non_field_errors = err?.response?.data?.non_field_errors?.[0]! // Ajout du ?. pour éviter l'erreur

            if (non_field_errors === "The fields name, grade must make a unique set.") {
                message.error(non_field_errors);
                  enqueueSnackbar("The fields name, grade must make a unique set !", { variant: "error" });
            } else {
                message.error(handleError(err));
            }
        },
        // Ajout du onSettled pour reset l'état loading
        onSettled: () => {
            // Cette fonction s'exécute après que la mutation soit terminée (succès ou erreur)
            // Ce n'est pas obligatoire mais peut être utile pour nettoyer
        }
    });
}