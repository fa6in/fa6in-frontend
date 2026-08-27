import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { handleError } from "../../../Auth-service/handleError";
import { refreshWilayas } from "./useGetWilaya";

export type WilayaPayload = {
  code: number;
  name: string;
};

async function createWilaya(params: WilayaPayload) {
  const res = await api.post(API_ENDPOINTS.auth.wilayas, params);
  return res.data;
}

export function useCreateWilaya() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWilaya,
    onSuccess: async () => {
      await refreshWilayas(queryClient);
      message.success("Wilaya créée avec succès");
    },
    onError: (err: unknown) => {
      message.error(handleError(err));
    },
  });
}
