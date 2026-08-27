
import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { unwrapList } from "../../../api/unwrapList";
import type { typeMatiere } from "./typeMatiere";

export const matiereKey = ["Matiere"]


async function getmatiere(): Promise<typeMatiere[]> {
    const res = await api.get(API_ENDPOINTS.curriculum.subjects)
    return unwrapList<typeMatiere>(res.data)
}

export function useGetMatiere() {
    return useQuery({
        queryKey: ["Matiere"],
        queryFn: () => getmatiere(),
    })
}