



import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { enqueueSnackbar } from "notistack";
import axios from "axios";
import { handleError } from "../../Auth-service/handleError";
import { BaseUrl } from "../../api/BaseUrl";

export type AdminType = {
    admin_secret_code: string;
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    role: string;
    // Ajoutez d'autres champs optionnels si nécessaire
};


export const useRegisterAdmin = () => {
    const queryClient = useQueryClient();

    async function addadmin(personne: AdminType) {

        const res = await axios.post(`${BaseUrl}api/auth/admin/register/`, personne);
        return res.data;
    }

    return useMutation({
        mutationFn: addadmin,
        mutationKey: [],

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: []
            });
            message.success("admin ajouté avec succès");
        },
        onError: (err: any) => {
            console.log(" err?.response?.data? : ", err?.response?.data?.password?.[0]!)
            const Regi = err?.response?.data?.password?.[0]!
            const email = err?.response?.data?.email?.[0]!
            const username = err?.response?.data?.username?.[0]!
            const messageError = err?.response?.data?.detail!

            if (messageError) {
                return enqueueSnackbar(messageError, { variant: "error" });
            } else if (Regi) {
                return enqueueSnackbar(Regi, { variant: "error" });
            } else if (email) {
                return enqueueSnackbar(email, { variant: "error" });
            }  else if (username) {
                return enqueueSnackbar(username, { variant: "error" });
            } else {
                return handleError(err);

            }
        }
    });
}

