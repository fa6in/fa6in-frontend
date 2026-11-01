import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BaseUrl } from "../../api/BaseUrl";
import AuthService from "../../Auth-service/AuthService";
import { useAuth } from "./AuthProvider";
import { handleError } from "../../Auth-service/handleError";

export type RegisterRole = "student" | "teacher" | "admin";

export type RegisterParams = {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: RegisterRole;
    password: string;
    password_confirm: string;
    phone_number: string;
    school: string;
    grade?: number;
};

const extractApiError = (error: any): string => {
    const data = error?.response?.data;
    if (!data) {
        if (error?.code === "ERR_NETWORK") return "تعذر الاتصال بالخادم.";
        return "حدث خطأ، حاول مجددًا.";
    }
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    const firstField = Object.keys(data)[0];
    const value = data[firstField];
    if (Array.isArray(value) && value[0]) return value[0];
    if (typeof value === "string") return value;
    return handleError(error);
};

async function register(params: RegisterParams) {
    const res = await axios.post(`${BaseUrl}api/auth/register/`, params, {
        headers: { "Content-Type": "application/json" },
    });
    return res.data;
}

export const useRegister = () => {
    const navigate = useNavigate();
    const { setAuthState } = useAuth();

    return useMutation({
        mutationFn: register,
        onSuccess: (data) => {
            if (data?.access && data?.user) {
                AuthService.setLoginData(data);
                setAuthState({
                    loading: false,
                    isAuthenticated: true,
                });
                window.dispatchEvent(new Event("storage"));
                window.dispatchEvent(new Event("auth-change"));

                // Comme après la connexion : chaque rôle arrive sur son accueil.
                window.location.href = "/";
                return navigate("/", { replace: true });
            }
            navigate("/login", { replace: true });
        },
        onError: (error: any) => {
            enqueueSnackbar(extractApiError(error), { variant: "error" });
        },
    });
};
