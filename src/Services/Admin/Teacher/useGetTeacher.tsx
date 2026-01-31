
import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import type { TeachersResponse } from "./typeTeacher";

export const TEACHER_KEY = ["Teacher"]

async function getTeacher(): Promise<TeachersResponse> {
    try {
        const res = await api.get("api/auth/admin/teachers/")
        return res.data
    } catch (error: any) {
        if (error.response) {
        }
        throw error
    }
}

export function useGetTeacher() {
    return useQuery({
        queryKey: ["Teacher"],
        queryFn: () => getTeacher(),
    })
}