import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BaseUrl } from "../../api/BaseUrl";
import { API_ENDPOINTS } from "../../api/endpoints";
import { handleError } from "../../Auth-service/handleError";

export type RegisterAdminParams = {
  admin_secret_code: string;
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: "admin";
};

async function registerAdmin(params: RegisterAdminParams) {
  const res = await axios.post(
    `${BaseUrl}${API_ENDPOINTS.auth.adminRegister}`,
    params,
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
}

export const useRegisterAdmin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerAdmin,
    onSuccess: () => {
      enqueueSnackbar("Administrateur créé avec succès", { variant: "success" });
      navigate("/login", { replace: true });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(handleError(error), { variant: "error" });
    },
  });
};
