import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { unwrapList } from "../../../api/unwrapList";
import type { typeChapitre } from "./typeChapitre";

export const chapitreKey = ["Chapitre"]


async function getchapitre(): Promise<typeChapitre[]> {
    const res = await api.get(API_ENDPOINTS.curriculum.units)
    return unwrapList<typeChapitre>(res.data)
}

export function useGetChapitre() {
    return useQuery({
        queryKey: ["Chapitre"],
        queryFn: () => getchapitre(),
    })
}