


import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import type { TypeContent } from "./typeContent";

export const KEY_CONTENT = ["Content"];

// Option 1: Si vous avez besoin de l'ID de l'unité et de l'ID de la section
async function getOnceContent(unitId: string, sectionId: string): Promise<TypeContent> {
    try {
        const res = await api.get(`/api/curriculum/units/${unitId}/sections/${sectionId}/`);
        return res.data;
    } catch (error: any) {
        if (error.response) {
            console.error("Error fetching content:", error.response.data);
        }
        throw error;
    }
}

export function useGetOnceContent(unitId: string | undefined, sectionId: string | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ["Content", "once", unitId, sectionId],
        queryFn: () => {
            if (!unitId || !sectionId) {
                throw new Error("Unit ID and Section ID are required");
            }
            return getOnceContent(unitId, sectionId);
        },
        enabled: options?.enabled !== undefined ? options.enabled : !!(unitId && sectionId),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
}

// Option 2: Si vous pouvez récupérer directement par l'ID de la section
// async function getOnceContent(sectionId: string): Promise<TypeContent> {
//     try {
//         const res = await api.get(`/api/curriculum/sections/${sectionId}/`);
//         return res.data;
//     } catch (error: any) {
//         if (error.response) {
//             console.error("Error fetching content:", error.response.data);
//         }
//         throw error;
//     }
// }

// export function useGetOnceContent(sectionId: string | undefined, options?: { enabled?: boolean }) {
//     return useQuery({
//         queryKey: ["Content", "once", sectionId],
//         queryFn: () => {
//             if (!sectionId) {
//                 throw new Error("Section ID is required");
//             }
//             return getOnceContent(sectionId);
//         },
//         enabled: options?.enabled !== undefined ? options.enabled : !!sectionId,
//         staleTime: 5 * 60 * 1000, // 5 minutes
//         retry: 1,
//     });
// }    