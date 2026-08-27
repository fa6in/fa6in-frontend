import { useQuery } from "@tanstack/react-query";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";

export const USERS_KEY = ["users"];

export type GetUsersParams = {
  role?: string;
  wilaya?: number;
};

export type UserListItem = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number?: string;
  is_active?: boolean;
};

async function getUsers(params?: GetUsersParams): Promise<UserListItem[]> {
  const res = await api.get(API_ENDPOINTS.auth.users, { params });
  return res.data?.results ?? res.data;
}

export function useGetUsers(params?: GetUsersParams, enabled = true) {
  return useQuery({
    queryKey: [...USERS_KEY, params],
    queryFn: () => getUsers(params),
    enabled,
  });
}
