import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { handleError } from "../../../Auth-service/handleError";
import { refreshWilayas } from "./useGetWilaya";

async function deleteWilaya(id: number | string) {
  const res = await api.delete(API_ENDPOINTS.auth.wilayaDetail(id));
  return res.data;
}

export function useDeleteWilaya() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWilaya,
    onSuccess: async () => {
      await refreshWilayas(queryClient);
      message.success("Wilaya supprimée avec succès");
    },
    onError: (err: unknown) => {
      message.error(handleError(err));
    },
  });
}
