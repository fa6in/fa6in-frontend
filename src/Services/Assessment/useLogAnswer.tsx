import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { handleError } from "../../Auth-service/handleError";
import type { LogAnswerParams } from "./typeAssessment";

async function logAnswer(params: LogAnswerParams) {
  const res = await api.post(API_ENDPOINTS.assessment.logAnswers, params);
  return res.data;
}

export function useLogAnswer() {
  return useMutation({
    mutationFn: logAnswer,
    onError: (err: unknown) => {
      message.error(handleError(err));
    },
  });
}
