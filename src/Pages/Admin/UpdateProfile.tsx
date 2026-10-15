import { Button, Card, Divider, Form, Input } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import type { ImageListType } from "react-images-uploading";
import ImageUploader from "../../ui/ImageUploader";
import { useGetProfile, type UserInfo } from "../../Services/Profile/useGetProfile";
import SpinnerLoader from "../../ui/SpinnerLoader";
import { useUpdateUser } from "../../Services/Profile/useUpdateProfile";
import { LOCAL_PHONE, LOCAL_PHONE_EXAMPLE, LOCAL_PHONE_HINT, normalizeLocalPhone } from "../../utils/phone";

type Props = {
  handleCancel: () => void;
};

export function UpdateProfileAdmin({ handleCancel }: Props) {
  const { data: clients, isPending: isPendingClient } = useGetProfile();
  const [images, setImages] = useState<ImageListType>([]);
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();

  const { mutate: UpdateProfile, isPending: isPendingProfile } = useUpdateUser();

  useEffect(() => {
    if (clients) {
      form.setFieldsValue({
        phone: clients.phone_number || "",
        firstName: clients.first_name || "",
        lastName: clients.last_name || "",
        email: clients.email || "",
      });

      if (clients.profile_image) {
        setImages([{ data_url: clients.profile_image }]);
      } else {
        setImages([]);
      }
    }
  }, [clients, form]);

  const handleUpdate = () => {
    form.validateFields().then((values) => {
      const file = images[0]?.file;

      const params: UserInfo = {
        phone_number: values.phone,
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email || clients?.email,
        username: clients?.username,
        school: clients?.school,
        profile_image: file!,
      };

      UpdateProfile(params, {
        onSuccess: () => handleCancel(),
      });
    }).catch(() => {
      enqueueSnackbar(t("navbar.profile.requiredFields"), { variant: "error" });
    });
  };

  if (isPendingClient) {
    return <SpinnerLoader />;
  }

  return (
    <div dir={i18n.language === "ar" ? "rtl" : "ltr"} className="space-y-5">
      <Card
        bordered={false}
        className="rounded-2xl border border-[#e5eee8] bg-gradient-to-br from-[#f6faf7] to-white"
        styles={{ body: { padding: "24px" } }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-main-color/10 text-main-color">
            <UserOutlined className="text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink">
              {t("navbar.profile.editProfile")}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {t("navbar.profile.formSubtitle")}
            </p>
          </div>
        </div>

        <Divider className="!my-5" />

        <div className="mb-6 flex justify-center">
          <ImageUploader
            placeholder={t("navbar.profile.avatar")}
            image={images}
            setImage={setImages}
          />
        </div>

        <Form form={form} layout="vertical" requiredMark={false}>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Form.Item
              label={t("navbar.profile.firstName")}
              name="firstName"
              rules={[{ required: true, message: t("navbar.profile.requiredFields") }]}
            >
              <Input size="large" placeholder={t("navbar.profile.firstName")} />
            </Form.Item>

            <Form.Item
              label={t("navbar.profile.lastName")}
              name="lastName"
              rules={[{ required: true, message: t("navbar.profile.requiredFields") }]}
            >
              <Input size="large" placeholder={t("navbar.profile.lastName")} />
            </Form.Item>

            <Form.Item
              className="md:col-span-2"
              label={t("navbar.profile.email", { defaultValue: "البريد الإلكتروني" })}
              name="email"
              rules={[
                { required: true, message: t("navbar.profile.requiredFields") },
                { type: "email", message: t("navbar.profile.requiredFields") },
              ]}
            >
              <Input size="large" type="email" placeholder="ahmed@example.com" />
            </Form.Item>

            <Form.Item
              className="md:col-span-2"
              label={t("navbar.profile.phone")}
              name="phone"
              normalize={normalizeLocalPhone}
              rules={[
                { required: true, message: t("navbar.profile.requiredFields") },
                { pattern: LOCAL_PHONE, message: LOCAL_PHONE_HINT },
              ]}
            >
              <Input size="large" type="tel" inputMode="numeric" maxLength={8} placeholder={LOCAL_PHONE_EXAMPLE} />
            </Form.Item>
          </div>
        </Form>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          size="large"
          className="!h-12 !border-main-color !text-main-color"
          onClick={handleCancel}
        >
          {t("navbar.profile.btn_annuler")}
        </Button>
        <Button
          size="large"
          loading={isPendingProfile}
          className="!h-12 !bg-main-color !text-white"
          onClick={handleUpdate}
        >
          {t("navbar.profile.buttn_confirm")}
        </Button>
      </div>
    </div>
  );
}
