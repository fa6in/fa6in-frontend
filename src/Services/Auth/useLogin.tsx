import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { BaseUrl } from "../../api/BaseUrl";
import AuthService from "../../Auth-service/AuthService";
import { useAuth } from "./AuthProvider";

export type LoginParams = {
    username: string;
    password: string;
};

async function login(params: LoginParams) {
    const res = await axios.post(`${BaseUrl}api/auth/login/`, params, {
        headers: { "Content-Type": "application/json" },
    });

    // Utiliser la nouvelle méthode pour stocker toutes les données
    AuthService.setLoginData(res.data);

    return res.data;
}

export const useLogin = () => {
    const navigate = useNavigate();
    const { setAuthState } = useAuth();

    return useMutation({
        mutationFn: login,
        onSuccess: async (data) => {
            try {
                setAuthState({
                    loading: false,
                    isAuthenticated: true,
                });

                window.dispatchEvent(new Event("storage"));
                window.dispatchEvent(new Event("auth-change"));

                // Redirection basée sur le rôle
                const userRole = data.user.role;
                if (userRole === "admin") {
                    navigate("/admin/dashboard", { replace: true });
                } else if (userRole === "student") {
                    navigate("/student", { replace: true });
                } else if (userRole === "teacher") {
                    navigate("/teacher", { replace: true });
                } else {
                    // Rôle inconnu
                    navigate("/", { replace: true });
                }

            } catch (e: any) {
                const err = e?.response?.data?.detail;
                return enqueueSnackbar(err || "Erreur lors de la connexion", { variant: "error" });
            }

            // Récupérer les informations utilisateur depuis AuthService
            const userInfo = AuthService.getUserInfo();
            const fullName = userInfo.full_name || userInfo.first_name || userInfo.username || "Utilisateur";
            const message = "Bienvenue " + fullName;

            enqueueSnackbar(message, { variant: "success" });
        },
        onError: (error: any) => {
            let message = "Une erreur est survenue";

            if (error?.code === "ERR_NETWORK") {
                message = "Erreur réseau : serveur injoignable";
            } else if (error?.response?.status === 401) {
                message = "Identifiants incorrects";
            } else if (error?.response?.status === 400) {
                // Gérer les erreurs de validation spécifiques
                const errorData = error.response.data;
                if (errorData.username) {
                    message = errorData.username[0];
                } else if (errorData.password) {
                    message = errorData.password[0];
                } else if (errorData.detail) {
                    message = errorData.detail;
                } else if (Array.isArray(errorData.non_field_errors) && errorData.non_field_errors.length > 0) {
                    message = errorData.non_field_errors[0];
                }
            }

            enqueueSnackbar(message, { variant: "error" });
        },
    });
};