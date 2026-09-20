
import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { unwrapList } from "../../../api/unwrapList";
import type { typeMatiere } from "./typeMatiere";

export const matiereKey = ["Matiere"]

export type MatiereFilters = {
    level?: number;
    is_active?: boolean;
};

async function getmatiere(filters: MatiereFilters = {}): Promise<typeMatiere[]> {
    const res = await api.get(API_ENDPOINTS.curriculum.subjects, { params: filters })
    return unwrapList<typeMatiere>(res.data)
}

export function useGetMatiere(filters: MatiereFilters = {}) {
    return useQuery({
        queryKey: ["Matiere", filters],
        queryFn: () => getmatiere(filters),
    })
}