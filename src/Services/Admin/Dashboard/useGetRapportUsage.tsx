

import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import type { UsageAnalyticsWithTrend } from "./type";

export const USAGE_DASHBOARD_KEY = ["dashboard-admin-usage"]

async function getUsageRapport(): Promise<UsageAnalyticsWithTrend> {
    try {
        const res = await api.get("api/analytics/reports/usage/")
        return res.data
    } catch (error: any) {
        if (error.response) {
        }
        throw error
    }
}

export function useGetRapportUsage() {
    return useQuery({
        queryKey: USAGE_DASHBOARD_KEY,
        queryFn: () => getUsageRapport(),
    })
}

