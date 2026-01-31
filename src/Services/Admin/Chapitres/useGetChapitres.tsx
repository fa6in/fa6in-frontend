import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import type { typeChapitre } from "./typeChapitre";

export const chapitreKey = ["Chapitre"]


async function getchapitre(): Promise<typeChapitre[]> {
    try {
        const res = await api.get("/api/curriculum/units/")
        return res.data
    } catch (error: any) {
        if (error.response) {
        }
        throw error
    }
}

export function useGetChapitre() {
    return useQuery({
        queryKey: ["Chapitre"],
        queryFn: () => getchapitre(),
    })
}