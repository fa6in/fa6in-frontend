import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { handleError } from "../../../Auth-service/handleError";
import { refreshWilayas } from "./useGetWilaya";
import type { WilayaPayload } from "./useCreateWilaya";

export type UpdateWilayaParams = WilayaPayload & { id: number };

async function updateWilaya({ id, ...body }: UpdateWilayaParams) {
  const res = await api.put(API_ENDPOINTS.auth.wilayaDetail(id), body);
  return res.data;
}

export function useUpdateWilaya() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateWilaya,
    onSuccess: async () => {
      await refreshWilayas(queryClient);
      message.success("Wilaya mise à jour avec succès");
    },
    onError: (err: unknown) => {
      message.error(handleError(err));
    },
  });
}
