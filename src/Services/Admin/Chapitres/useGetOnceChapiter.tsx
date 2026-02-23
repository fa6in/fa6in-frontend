import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import type { typeChapitre } from "./typeChapitre";

export const chapitreKey = ["Chapitre"];

async function getoncechapitre(chap: string): Promise<typeChapitre> {
    try {
        const res = await api.get(`api/curriculum/units/${chap}/`);
        return res.data;
    } catch (error: any) {
        if (error.response) {
            console.error('Error fetching chapter:', error.response.data);
        }
        throw error;
    }
}

interface UseGetOnceChapitreOptions {
    enabled?: boolean;
}

export function useGetOnceChapitre(chap: string, options?: UseGetOnceChapitreOptions) {
    return useQuery({
        queryKey: ["Chapitre", chap],
        queryFn: () => getoncechapitre(chap),
        enabled: options?.enabled ?? !!chap, // Activer la requête seulement si chap existe
        retry: 1, // Réessayer une fois en cas d'échec
        staleTime: 5 * 60 * 1000, // Considérer les données comme fraîches pendant 5 minutes
    });
}

