



import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { enqueueSnackbar } from "notistack";
import axios from "axios";
import { handleError } from "../../Auth-service/handleError";

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

        const res = await axios.post(`api/auth/admin/register/`, personne);
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
            console.log( " err?.response?.data? : ", err?.response?.data?.detail!)
            const messageError = err?.response?.data?.detail!

            if (messageError) {
                return enqueueSnackbar(messageError, { variant: "error" });
            } else {
               return  handleError(err);

            }
        }
    });
}

