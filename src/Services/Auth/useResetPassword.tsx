import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { BaseUrl } from "../../api/BaseUrl";
import { handleError } from "../../Auth-service/handleError";

export type ResetPasswordParams = {
    code: string;
    email: string;
    new_password: string;
    new_password_confirm: string;
};

async function resetPassword(params: ResetPasswordParams) {
    const res = await axios.post(`${BaseUrl}api/auth/reset-password/`, params, {
        headers: { "Content-Type": "application/json" },
    });
    return res.data;
}

export const useResetPassword = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: resetPassword,
        onSuccess: () => {
            enqueueSnackbar("تم تغيير كلمة المرور. سجّل الدخول الآن.", { variant: "success" });
            navigate("/login", { replace: true });
        },
        onError: (error: any) => {
            const data = error?.response?.data;
            let message = "حدث خطأ، حاول مجددًا.";
            if (error?.code === "ERR_NETWORK") {
                message = "تعذر الاتصال بالخادم.";
            } else if (data?.detail) {
                message = data.detail;
            } else if (data?.message) {
                message = data.message;
            } else if (data?.code?.[0]) {
                message = data.code[0];
            } else if (data?.email?.[0]) {
                message = data.email[0];
            } else if (data?.new_password?.[0]) {
                message = data.new_password[0];
            } else if (data?.new_password_confirm?.[0]) {
                message = data.new_password_confirm[0];
            } else {
                message = handleError(error);
            }
            enqueueSnackbar(message, { variant: "error" });
        },
    });
};
