import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { handleError } from "../../Auth-service/handleError";

export type TranscrireResponse = {
  text?: string;
  transcription?: string;
};

async function transcrireAudio(audioFile: File) {
  const formData = new FormData();
  formData.append("audio_file", audioFile);
  const res = await api.post(API_ENDPOINTS.curriculum.transcrire, formData);
  return res.data as TranscrireResponse;
}

export function useTranscrireAudio() {
  return useMutation({
    mutationFn: transcrireAudio,
    onError: (err: unknown) => {
      message.error(handleError(err));
    },
  });
}
