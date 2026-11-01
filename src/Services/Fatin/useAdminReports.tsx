import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { unwrapList } from "../../api/unwrapList";
import { apiErrorText } from "./apiErrorText";
import type { AppUser, AttentionItem, Page, ReportsOverview, ReportsUsage, UserRole, WilayaMastery } from "./types";

export const ADMIN_REPORTS_KEY = ["fatin-admin-reports"];
export const USERS_KEY = ["fatin-users"];

export function useReportsOverview() {
  return useQuery({
    queryKey: [...ADMIN_REPORTS_KEY, "overview"],
    queryFn: async (): Promise<ReportsOverview> => (await api.get(API_ENDPOINTS.dashboards.reports)).data,
  });
}

export function useReportsUsage(days: number) {
  return useQuery({
    queryKey: [...ADMIN_REPORTS_KEY, "usage", days],
    queryFn: async (): Promise<ReportsUsage> => (await api.get(API_ENDPOINTS.dashboards.reportsUsage, { params: { days } })).data,
  });
}

export function useReportsAttention() {
  return useQuery({
    queryKey: [...ADMIN_REPORTS_KEY, "attention"],
    queryFn: async (): Promise<AttentionItem[]> => (await api.get(API_ENDPOINTS.dashboards.reportsAttention)).data,
  });
}

export function useReportsByWilaya() {
  return useQuery({
    queryKey: [...ADMIN_REPORTS_KEY, "by-wilaya"],
    queryFn: async (): Promise<WilayaMastery[]> => (await api.get(API_ENDPOINTS.dashboards.reportsByWilaya)).data,
  });
}

export type UsersFilters = { role?: UserRole; wilaya?: number; search?: string; page?: number };

export function useUsers(filters: UsersFilters) {
  return useQuery({
    queryKey: [...USERS_KEY, filters],
    queryFn: async (): Promise<Page<AppUser>> => {
      const res = await api.get(API_ENDPOINTS.dashboards.users, { params: { page_size: 20, ...filters } });
      const data = res.data;
      if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data };
      return { ...data, results: unwrapList<AppUser>(data) };
    },
    placeholderData: (previous) => previous,
  });
}

type UserRequest = { method: "post" | "patch" | "delete"; id?: number; data?: unknown; success: string };

export function useUserSave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ method, id, data }: UserRequest) =>
      (await api.request({
        method,
        url: id ? API_ENDPOINTS.dashboards.userDetail(id) : API_ENDPOINTS.dashboards.users,
        data,
      })).data,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      message.success(variables.success);
    },
    onError: (error) => message.error(apiErrorText(error)),
  });
}
