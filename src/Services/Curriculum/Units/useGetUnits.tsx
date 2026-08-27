import { useQuery } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { unwrapList } from "../../../api/unwrapList";
import type { Unit } from "./typeUnit";

export const UNITS_KEY = ["units"];

async function getUnits(): Promise<Unit[]> {
  const res = await api.get(API_ENDPOINTS.curriculum.units);
  return unwrapList<Unit>(res.data);
}

export function useGetUnits() {
  return useQuery({
    queryKey: UNITS_KEY,
    queryFn: getUnits,
  });
}
