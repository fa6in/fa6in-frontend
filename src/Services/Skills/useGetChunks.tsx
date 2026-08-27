import { useQuery } from "@tanstack/react-query";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import type { Chunk } from "./typeSkill";

export const CHUNKS_KEY = ["chunks"];

async function getChunks(): Promise<Chunk[]> {
  const res = await api.get(API_ENDPOINTS.skills.chunks);
  return res.data?.results ?? res.data;
}

export function useGetChunks() {
  return useQuery({
    queryKey: CHUNKS_KEY,
    queryFn: getChunks,
  });
}
