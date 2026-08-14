import { useState, type ReactNode } from "react";
import { Form, Input, Button, Select } from "antd";
import {
  HiOutlineAcademicCap,
  HiOutlinePresentationChartLine,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineIdentification,
  HiOutlineAtSymbol,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineBuildingLibrary,
  HiOutlineBookOpen,
  HiOutlineLockClosed,
  HiOutlineKey,
} from "react-icons/hi2";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRegister, type RegisterParams, type RegisterRole } from "../../Services/Auth/useRegister";
import AuthLayout from "./AuthLayout";

const fieldIcon = (icon: ReactNode) => (
  <span className="auth-field-icon">{icon}</span>
);

const roles: { value: RegisterRole; icon: ReactNode }[] = [
  { value: "student", icon: <HiOutlineAcademicCap /> },
  { value: "teacher", icon: <HiOutlinePresentationChartLine /> },
  { value: "admin", icon: <HiOutlineShieldCheck /> },
];

const gradeOptions = [1, 2, 3, 4, 5, 6];

const RegisterPage = () => {
  const [form] = Form.useForm<RegisterParams>();
  const { t } = useTranslation();
  const { mutate: register, isPending } = useRegister();
  const [role, setRole] = useState<RegisterRole>("student");
  const [shake, setShake] = useState(0);

  const onFinish = (values: RegisterParams) => {
    const payload: RegisterParams = {
      ...values,
      role,
      grade: role === "student" ? values.grade : undefined,
    };
    register(payload);
  };

  return (
    <AuthLayout compact>
      <motion.div
        key={shake}
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="auth-title">{t("register.title")}</h2>
        <p className="auth-subtitle">{t("register.subtitle")}</p>

        <p className="text-sm font-semibold text-gray-700 mb-2">{t("register.choose_role")}</p>
        <div className="auth-role-grid">
          {roles.map((item) => (
            <motion.button
              type="button"
              key={item.value}
              whileTap={{ scale: 0.97 }}
              className={`auth-role-card ${role === item.value ? "active" : ""}`}
              onClick={() => {
                setRole(item.value);
                form.setFieldValue("role", item.value);
              }}
            >
              <span className="auth-role-icon">{item.icon}</span>
              <div className="text-sm font-semibold text-gray-800">
                {t(`register.role_${item.value}`)}
              </div>
            </motion.button>
          ))}
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          onFinishFailed={() => setShake((n) => n + 1)}
          layout="vertical"
          size="large"
          requiredMark={false}
          initialValues={{ role: "student" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
            <Form.Item
              name="first_name"
              label={t("register.first_name")}
              rules={[{ required: true, message: t("register.first_name_required") }]}
            >
              <Input
                className="auth-input"
                prefix={fieldIcon(<HiOutlineUser />)}
                placeholder={t("register.first_name_placeholder")}
              />
            </Form.Item>
            <Form.Item
              name="last_name"
              label={t("register.last_name")}
              rules={[{ required: true, message: t("register.last_name_required") }]}
            >
              <Input
                className="auth-input"
                prefix={fieldIcon(<HiOutlineIdentification />)}
                placeholder={t("register.last_name_placeholder")}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
            <Form.Item
              name="username"
              label={t("register.username")}
              rules={[
                { required: true, message: t("register.username_required") },
                { min: 3, message: t("register.username_min") },
              ]}
            >
              <Input
                className="auth-input"
                prefix={fieldIcon(<HiOutlineAtSymbol />)}
                placeholder={t("register.username_placeholder")}
                autoComplete="username"
              />
            </Form.Item>
            <Form.Item
              name="email"
              label={t("register.email")}
              rules={[
                { required: true, message: t("register.email_required") },
                { type: "email", message: t("register.email_invalid") },
              ]}
            >
              <Input
                className="auth-input"
                prefix={fieldIcon(<HiOutlineEnvelope />)}
                placeholder={t("register.email_placeholder")}
                autoComplete="email"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
            <Form.Item
              name="phone_number"
              label={t("register.phone_number")}
              rules={[
                { required: true, message: t("register.phone_number_required") },
                { pattern: /^[0-9+\s-]{8,15}$/, message: t("register.phone_number_invalid") },
              ]}
            >
              <Input
                className="auth-input"
                prefix={fieldIcon(<HiOutlinePhone />)}
                placeholder={t("register.phone_number_placeholder")}
              />
            </Form.Item>
            <Form.Item
              name="school"
              label={t("register.school")}
              rules={[{ required: true, message: t("register.school_required") }]}
            >
              <Input
                className="auth-input"
                prefix={fieldIcon(<HiOutlineBuildingLibrary />)}
                placeholder={t("register.school_placeholder")}
              />
            </Form.Item>
          </div>

          {role === "student" && (
            <Form.Item
              name="grade"
              label={t("register.grade")}
              rules={[{ required: true, message: t("register.grade_required") }]}
            >
              <Select
                className="auth-input"
                placeholder={t("register.grade_placeholder")}
                suffixIcon={fieldIcon(<HiOutlineBookOpen />)}
                options={gradeOptions.map((grade) => ({
                  value: grade,
                  label: `${t("register.grade")} ${grade}`,
                }))}
              />
            </Form.Item>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
            <Form.Item
              name="password"
              label={t("register.password")}
              rules={[
                { required: true, message: t("register.password_required") },
                { min: 8, message: t("register.password_min") },
              ]}
            >
              <Input.Password
                className="auth-input"
                prefix={fieldIcon(<HiOutlineLockClosed />)}
                placeholder={t("register.password_placeholder")}
                autoComplete="new-password"
              />
            </Form.Item>
            <Form.Item
              name="password_confirm"
              label={t("register.password2")}
              dependencies={["password"]}
              rules={[
                { required: true, message: t("register.password2_required") },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t("register.password2_match")));
                  },
                }),
              ]}
            >
              <Input.Password
                className="auth-input"
                prefix={fieldIcon(<HiOutlineKey />)}
                placeholder={t("register.password2_placeholder")}
                autoComplete="new-password"
              />
            </Form.Item>
          </div>

          <Form.Item className="mb-3 mt-1">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button htmlType="submit" loading={isPending} block className="auth-submit">
                {t("register.submit")}
              </Button>
            </motion.div>
          </Form.Item>
        </Form>

        <p className="text-center text-sm text-gray-500 mt-2">
          {t("register.already_account")}{" "}
          <Link to="/login" className="auth-link">
            {t("register.login_link")}
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
};

export default RegisterPage;
