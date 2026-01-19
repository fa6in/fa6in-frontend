

import { Button, Input, Space } from "antd";
import { useTranslation } from "react-i18next";


import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import type { ImageListType } from "react-images-uploading";
import ImageUploader from "../../ui/ImageUploader";
import { useGetProfile, type UserInfo } from "../../Services/Profile/useGetProfile";
import SpinnerLoader from "../../ui/SpinnerLoader";
import { useUpdateUser } from "../../Services/Profile/useUpdateProfile";
type Props = {
    handleCancel: () => void;
};
export const validateEmail = (email: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
};

export function UpdateProfileAdmin({ handleCancel }: Props) {
    const { data: clients, isPending: isPendingClient } = useGetProfile()
    const [images, setImages] = useState<ImageListType>([]);
    const {t} = useTranslation()
    const { i18n } = useTranslation()

    const [username, setUsername] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastname, setLastName] = useState("")
    const [phone, setPhone] = useState("")
    // const [grade, setGrade] = useState("")


    const { mutate: UpdateProfile, isPending: isPendingProfile } = useUpdateUser()

    useEffect(() => {
        if (clients) {
            setUsername(clients.username || "");
            setFirstName(clients.first_name || "");
            setLastName(clients.last_name || "");
            setPhone(clients.phone_number || "");

            if (clients.profile_image) {
                setImages([{ data_url: clients.profile_image }]);
            } else {
                setImages([]);
            }
        }
    }, [clients])



    const handleUpdate = () => {
        if (!phone || !firstName || !lastname || !username) {
            enqueueSnackbar("Tous les champs sont obligatoires !", { variant: "error" });
        }
        //  else if (!validateEmail(email)) {
        //     return message.error(t("Entrez une adresse e-mail valide !"))
        // }
        // else if (images?.length === 0) {
        //     message.error("please select the image !")
        // }
        else {
            const file = images[0]?.file;

            const params: UserInfo = {
                // email: email,
                phone_number: phone,
                first_name: firstName,
                last_name: lastname,
                username: clients?.username,
                profile_image: file!

            }
            UpdateProfile(params, {
                onSuccess: () => {
                    handleCancel()
                }
            })
        }
    }
    if (isPendingClient || isPendingProfile) {
        return <SpinnerLoader />
    }
    return (
        <div dir={i18n.language === "ar" ? "rtl" : "ltr"} className="p-4 md:p-6 lg:p-7 2xl:p-8 space-y-4 md:space-y-5 lg:space-y-6 2xl:space-y-7">
            <div className="flex items-center justify-center flex-col space-y-2">
                <ImageUploader
                    placeholder="Profile Image"
                    image={images}
                    setImage={setImages}
                />


            </div>
            <div className="grid grid-cols-2 gap-y-1 gap-x-3">

                {/* <Space direction="vertical">
                    <label className="text-blue-2a text-[13px]" htmlFor="">
                        Username


                    </label>
                    <Input
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        placeholder="Medos"
                    />
                </Space> */}

                <Space direction="vertical" className="">
                    <label className="text-blue-2a text-[13px]" htmlFor="">
                        {/* {t("Email")} */}
                        Phone Number
                    </label>
                    <Input
                        type="number"
                        onChange={(e) => setPhone(e.target.value)}
                        value={phone}

                        placeholder={"48354773"}

                    />
                </Space>

                <Space direction="vertical">
                    <label className="text-blue-2a text-[13px]" htmlFor="">
                        {/* {t("Nom")} */}
                        First Name


                    </label>
                    <Input
                        onChange={(e) => setFirstName(e.target.value)}
                        value={firstName}
                        placeholder="Medos"
                    />
                </Space>



                {/* <Space direction="vertical" className="grid col-span-2"> */}

                <Space direction="vertical" className="">
                    <label className="text-blue-2a text-[13px]" htmlFor="">
                        Last Name
                    </label>
                    <Input
                        type="text"
                        onChange={(e) => setLastName(e.target.value)}
                        value={lastname}

                        placeholder={"lastname"}
                    />
                </Space>

            </div>
            <div className="grid grid-cols-2 items-center gap-x-4 mt-4 md:mt-5">
                <Button className=" h-[50.6px]   mt-2 !border-main-color !text-main-color" onClick={handleCancel}>{t("navbar.profile.btn_annuler")} </Button>
                <Button loading={isPendingProfile} className=" h-[50.6px] mt-2 !bg-main-color !text-white" onClick={handleUpdate}
                >
                    {t("navbar.profile.buttn_confirm")}
                </Button>

            </div>
        </div>
    );
}
