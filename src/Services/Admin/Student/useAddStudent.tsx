





// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { message } from "antd";

// export const useAddpharmacy = () => {
//   const queryClient = useQueryClient();

//   async function addpharmacy(pharmacy: AddPharmacyData) {
//     const formData = new FormData();
//     formData.append("category", pharmacy?.category!);
//     formData.append("business_name", pharmacy?.business_name!);
//     formData.append("bio", pharmacy?.bio!);
//     formData.append("phone_number", pharmacy?.phone_number!);
//     formData.append("is_active", pharmacy?.is_active!.toString());
//     formData.append("is_oncall", pharmacy?.is_oncall!.toString());

//     // Ajouter la location au FormData
//     formData.append("location", pharmacy?.location!);

//     if (pharmacy.logo) {
//       formData.append("logo", pharmacy.logo);
//     }
//     if (pharmacy.background_image) {
//       formData.append("background_image", pharmacy.background_image);
//     }

//     const res = await api.post(`api/vendors/`, formData);
//     return res.data;
//   }

//   return useMutation({
//     mutationFn: addpharmacy,
//     mutationKey: PHARAMCY_KEY,

//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: PHARAMCY_KEY
//       });
//       message.success("pharmacy ajouté avec succès");
//     },
//     onError: (err: any) => {
//       const messageError = err?.response?.data?.logo[0]

//       if (messageError) {
//         return message.error(messageError);
//       }
//       handleError(err);
//     }
//   });
// }