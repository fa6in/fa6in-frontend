import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { BaseUrl } from "../../api/BaseUrl";
import { handleError } from "../../Auth-service/handleError";

export type ForgotPasswordParams = {
    email: string;
};

async function forgotPassword(params: ForgotPasswordParams) {
    const res = await axios.post(`${BaseUrl}api/auth/forgot-password/`, params, {
        headers: { "Content-Type": "application/json" },
    });
    return res.data;
}

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: forgotPassword,
        onError: (error: any) => {
            const data = error?.response?.data;
            let message = "حدث خطأ، حاول مجددًا.";
            if (error?.code === "ERR_NETWORK") {
                message = "تعذر الاتصال بالخادم.";
            } else if (data?.email?.[0]) {
                message = data.email[0];
            } else if (data?.detail) {
                message = data.detail;
            } else if (data?.message) {
                message = data.message;
            } else {
                message = handleError(error);
            }
            enqueueSnackbar(message, { variant: "error" });
        },
    });
};
