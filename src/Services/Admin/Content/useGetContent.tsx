import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import type { TypeContent } from "./typeContent";

export const KEY_CONTENT = ["Content"];
async function getcontent(id: number): Promise<TypeContent[]> {
    try {
        const res = await api.get(`/api/curriculum/units/${id}/sections/`);
        return res.data;
    } catch (error: any) {
        if (error.response) {
            // Gérer l'erreur si nécessaire
        }
        throw error;
    }
}

export function useGetContent(id: number | undefined) {
    return useQuery({
        queryKey: ["Content", id], // Inclure l'id dans la queryKey pour la mise en cache par id
        queryFn: () => {
            if (!id) {
                throw new Error("ID is required");
            }
            return getcontent(id);
        },
        // enabled: !!id, // Ne lancer la requête que si l'id est défini
        // staleTime: 5 * 60 * 1000, // 5 minutes (optionnel)
        // retry: 1, // Nombre de tentatives en cas d'erreur (optionnel)
    });
}