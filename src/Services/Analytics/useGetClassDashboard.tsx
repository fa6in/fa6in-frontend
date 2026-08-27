import { useQuery } from "@tanstack/react-query";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";

export const CLASS_DASHBOARD_KEY = ["class-dashboard"];

export type ClassDashboardParams = {
  level?: number;
};

async function getClassDashboard(params?: ClassDashboardParams) {
  const res = await api.get(API_ENDPOINTS.analytics.classDashboard, { params });
  return res.data;
}

export function useGetClassDashboard(params?: ClassDashboardParams) {
  return useQuery({
    queryKey: [...CLASS_DASHBOARD_KEY, params],
    queryFn: () => getClassDashboard(params),
  });
}
