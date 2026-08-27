import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../Auth-service/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { handleError } from "../../Auth-service/handleError";

export type ChangePasswordParams = {
  userId: number | string;
  old_password: string;
  new_password: string;
};

async function changePassword({ userId, ...body }: ChangePasswordParams) {
  const res = await api.post(API_ENDPOINTS.auth.changePassword(userId), body);
  return res.data;
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      message.success("Mot de passe modifié avec succès");
    },
    onError: (err: unknown) => {
      message.error(handleError(err));
    },
  });
}
