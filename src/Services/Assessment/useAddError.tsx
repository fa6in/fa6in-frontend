import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { handleError } from "../../Auth-service/handleError";
import type { AssessmentError } from "./typeAssessment";
import { ERRORS_KEY } from "./useGetErrors";

async function addError(error: AssessmentError) {
  const res = await api.post(API_ENDPOINTS.assessment.errors, error);
  return res.data;
}

export function useAddError() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ERRORS_KEY });
      message.success("Erreur enregistrée avec succès");
    },
    onError: (err: unknown) => {
      message.error(handleError(err));
    },
  });
}
