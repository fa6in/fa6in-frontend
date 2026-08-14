import { Form, Input, Button } from "antd";
import { HiOutlineEnvelope } from "react-icons/hi2";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForgotPassword } from "../../Services/Auth/useForgotPassword";
import AuthLayout from "./AuthLayout";

const ForgetPassword = () => {
  const [form] = Form.useForm<{ email: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: sendReset, isPending } = useForgotPassword();

  const onFinish = (values: { email: string }) => {
    sendReset(values, {
      onSuccess: () => {
        navigate(`/reset-password?email=${encodeURIComponent(values.email)}`);
      },
    });
  };

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="auth-title">{t("forgotPassword.title")}</h2>
        <p className="auth-subtitle">{t("forgotPassword.subtitle")}</p>

        <Form
          form={form}
          name="forgotPassword"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label={t("forgotPassword.email")}
            rules={[
              { required: true, message: t("forgotPassword.email_required") },
              { type: "email", message: t("forgotPassword.email_invalid") },
            ]}
          >
            <Input
              className="auth-input"
              prefix={<span className="auth-field-icon"><HiOutlineEnvelope /></span>}
              placeholder={t("forgotPassword.email_placeholder")}
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item className="mb-3">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button htmlType="submit" loading={isPending} block className="auth-submit">
                {t("forgotPassword.submit")}
              </Button>
            </motion.div>
          </Form.Item>
        </Form>

        <p className="text-center text-sm text-gray-500">
          <Link to="/login" className="auth-link">
            {t("forgotPassword.back_to_login")}
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
};

export default ForgetPassword;
