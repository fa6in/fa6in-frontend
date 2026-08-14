import { Form, Input, Button } from "antd";
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineKey, HiOutlineShieldCheck } from "react-icons/hi2";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useResetPassword } from "../../Services/Auth/useResetPassword";
import AuthLayout from "./AuthLayout";

type ResetForm = {
  email: string;
  code: string;
  new_password: string;
  new_password_confirm: string;
};

const ResetPasswordPage = () => {
  const [form] = Form.useForm<ResetForm>();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { mutate: resetPassword, isPending } = useResetPassword();
  const emailFromQuery = searchParams.get("email") || "";

  const onFinish = (values: ResetForm) => {
    resetPassword({
      code: values.code,
      email: values.email,
      new_password: values.new_password,
      new_password_confirm: values.new_password_confirm,
    });
  };

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="auth-title">{t("resetPassword.title")}</h2>
        <p className="auth-subtitle">{t("resetPassword.subtitle")}</p>

        <Form
          form={form}
          name="resetPassword"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          requiredMark={false}
          initialValues={{ email: emailFromQuery }}
        >
          <Form.Item
            name="email"
            label={t("resetPassword.email")}
            rules={[
              { required: true, message: t("resetPassword.email_required") },
              { type: "email", message: t("resetPassword.email_invalid") },
            ]}
          >
            <Input
              className="auth-input"
              prefix={<span className="auth-field-icon"><HiOutlineEnvelope /></span>}
              placeholder={t("resetPassword.email_placeholder")}
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="code"
            label={t("resetPassword.code")}
            rules={[
              { required: true, message: t("resetPassword.code_required") },
              { len: 4, message: t("resetPassword.code_length") },
            ]}
          >
            <Input
              className="auth-input"
              prefix={<span className="auth-field-icon"><HiOutlineShieldCheck /></span>}
              placeholder={t("resetPassword.code_placeholder")}
              maxLength={4}
              inputMode="numeric"
            />
          </Form.Item>

          <Form.Item
            name="new_password"
            label={t("resetPassword.password")}
            rules={[
              { required: true, message: t("resetPassword.password_required") },
              { min: 8, message: t("resetPassword.password_min") },
            ]}
          >
            <Input.Password
              className="auth-input"
              prefix={<span className="auth-field-icon"><HiOutlineLockClosed /></span>}
              placeholder={t("resetPassword.password_placeholder")}
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="new_password_confirm"
            label={t("resetPassword.password_confirm")}
            dependencies={["new_password"]}
            rules={[
              { required: true, message: t("resetPassword.password_confirm_required") },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("new_password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t("resetPassword.password_mismatch")));
                },
              }),
            ]}
          >
            <Input.Password
              className="auth-input"
              prefix={<span className="auth-field-icon"><HiOutlineKey /></span>}
              placeholder={t("resetPassword.password_confirm_placeholder")}
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item className="mb-3">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button htmlType="submit" loading={isPending} block className="auth-submit">
                {t("resetPassword.submit")}
              </Button>
            </motion.div>
          </Form.Item>
        </Form>

        <p className="text-center text-sm text-gray-500">
          <Link to="/forgot-password" className="auth-link">
            {t("resetPassword.request_new")}
          </Link>
          {" · "}
          <Link to="/login" className="auth-link">
            {t("resetPassword.back_to_login")}
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
