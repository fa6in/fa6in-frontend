
import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import type { typeMatiere } from "./typeMatiere";

export const matiereKey = ["Matiere"]


async function getmatiere(): Promise<typeMatiere[]> {
    try {
        const res = await api.get("api/curriculum/subjects/")
        return res.data
    } catch (error: any) {
        if (error.response) {

        }
        throw error
    }
}

export function useGetMatiere() {
    return useQuery({
        queryKey: ["Matiere"],
        queryFn: () => getmatiere(),
    })
}