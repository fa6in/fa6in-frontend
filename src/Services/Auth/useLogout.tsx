





import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import AuthService from "../../Auth-service/AuthService";



export async function logout() {
    AuthService.clearTokens()
}

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries();
    },
    onError: (err:any) => {
      message.error(err.message);
    },
  });
};
