


import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";

export const WILAYA_KEY = ["wilaya"]

export type WilayaTYpe = {
    id: number,
    code: number,
    name: string
}
async function getWilaya(): Promise<WilayaTYpe[]> {
    try {
        const res = await api.get("/api/auth/wilayas/")
        return res.data
    } catch (error: any) {
        if (error.response) {
        }
        throw error
    }
}

export function useGetWilaya() {
    return useQuery({
        queryKey: ["wilaya"],
        queryFn: () => getWilaya(),
    })
}