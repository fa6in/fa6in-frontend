


import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import type { StudentsResponse } from "./typeStudent";
import AuthService from "../../../Auth-service/AuthService";

export const STUDENT_KEY = ["Student"]


async function getStudent(): Promise<StudentsResponse> {
    const post = AuthService.getRole()
    console.log("role in useGetStudents : ", post)
    // const endpoint = post === "admin" ? "api/auth/admin/students/" : "api/auth/admin/students/";

    try {
        const res = await api.get("api/auth/admin/students/")
        return res.data
    } catch (error: any) {
        if (error.response) {

        }
        throw error
    }
}

export function useGetStudents() {
    return useQuery({
        queryKey: ["Student"],
        queryFn: () => getStudent(),
    })
}