import { useState } from "react";
import { Form, Input, Button } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLogin, type LoginParams } from "../../Services/Auth/useLogin";
import AuthLayout from "./AuthLayout";

const LoginPage = () => {
  const [form] = Form.useForm<LoginParams>();
  const { t } = useTranslation();
  const { mutate: datalogin, isPending } = useLogin();
  const [shake, setShake] = useState(0);

  const onFinish = (values: LoginParams) => {
    datalogin(values);
  };

  return (
    <AuthLayout>
      <motion.div
        key={shake}
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="auth-title">{t("login.welcome")}</h2>
        <p className="auth-subtitle">{t("login.subtitle")}</p>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          onFinishFailed={() => setShake((n) => n + 1)}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            label={t("login.username")}
            rules={[{ required: true, message: t("login.enter_username") }]}
          >
            <Input
              className="auth-input"
              prefix={<UserOutlined className="text-main-color" />}
              placeholder={t("login.username")}
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={t("login.password")}
            rules={[{ required: true, message: t("login.enter_password") }]}
          >
            <Input.Password
              className="auth-input"
              prefix={<LockOutlined className="text-main-color" />}
              placeholder={t("login.password")}
              autoComplete="current-password"
            />
          </Form.Item>

          <div className="flex justify-end -mt-2 mb-4">
            <Link to="/forgot-password" className="auth-link text-sm">
              {t("login.forget_password")}
            </Link>
          </div>

          <Form.Item className="mb-3">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button htmlType="submit" loading={isPending} block className="auth-submit">
                {t("login.login")}
              </Button>
            </motion.div>
          </Form.Item>
        </Form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-400">{t("login.or")}</span>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          {t("login.no_account")}{" "}
          <Link to="/register" className="auth-link">
            {t("login.create_account")}
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
};

export default LoginPage;
